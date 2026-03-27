import Runtime "mo:core/Runtime";
import Map "mo:core/Map";
import Array "mo:core/Array";
import Text "mo:core/Text";
import Time "mo:core/Time";

import Principal "mo:core/Principal";
import Order "mo:core/Order";
import AccessControl "authorization/access-control";
import MixinAuthorization "authorization/MixinAuthorization";
import MixinStorage "blob-storage/Mixin";


actor {
  let accessControlState = AccessControl.initState();
  include MixinAuthorization(accessControlState);
  include MixinStorage();

  // Admin credentials
  stable var adminEmail : Text = "admin@cargivo.com";
  stable var adminPassword : Text = "Cargivo@2024";
  stable var admin2Email : Text = "lovepreet_singh@cargivo.shop";
  stable var admin2Password : Text = "Cargivo@2024";

  type CustomerProfile = {
    companyName : Text;
    gstNumber : Text;
    address : Text;
    phone : Text;
    contactName : Text;
    email : Text;
  };

  module CustomerProfile {
    public func compareByCompanyName(p1 : CustomerProfile, p2 : CustomerProfile) : Order.Order {
      Text.compare(p1.companyName, p2.companyName);
    };
  };

  // V1 type (old — kept for migration only)
  type QuoteRequestV1 = {
    id : Nat;
    customerId : Principal;
    boxType : Text;
    length : Float;
    width : Float;
    height : Float;
    material : Text;
    quantity : Nat;
    drawingFileId : ?Text;
    deliveryLocation : Text;
    status : Text;
    createdAt : Int;
    adminNotes : ?Text;
  };

  // Current type with new fields
  type QuoteRequest = {
    id : Nat;
    customerId : Principal;
    boxType : Text;
    length : Float;
    width : Float;
    height : Float;
    material : Text;
    quantity : Nat;
    drawingFileId : ?Text;
    deliveryLocation : Text;
    status : Text;
    createdAt : Int;
    adminNotes : ?Text;
    declineReason : ?Text;
    advancePaymentNotified : Bool;
    finalPaymentNotified : Bool;
    deliveryDetails : ?Text;
  };

  type Quotation = {
    requestId : Nat;
    basePrice : Float;
    gstPercent : Float;
    totalPrice : Float;
    deliveryCharge : Float;
    validUntil : Int;
    notes : ?Text;
    sentAt : Int;
  };

  type OrderRecord = {
    requestId : Nat;
    customerId : Principal;
    advancePaid : Bool;
    finalPaid : Bool;
    manufacturingNotes : ?Text;
    deliveryTrackingInfo : ?Text;
  };

  type InvoiceData = {
    request : QuoteRequest;
    quotation : Quotation;
    customer : CustomerProfile;
  };

  type RegisterCustomerProfileArgs = {
    companyName : Text;
    gstNumber : Text;
    address : Text;
    phone : Text;
    contactName : Text;
    email : Text;
  };

  type QuoteRequestArgs = {
    boxType : Text;
    length : Float;
    width : Float;
    height : Float;
    material : Text;
    quantity : Nat;
    drawingFileId : ?Text;
    deliveryLocation : Text;
  };

  type QuotationArgs = {
    requestId : Nat;
    basePrice : Float;
    gstPercent : Float;
    deliveryCharge : Float;
    validUntil : Int;
    notes : ?Text;
  };

  type OrderUpdateArgs = {
    requestId : Nat;
    manufacturingNotes : ?Text;
    deliveryTrackingInfo : ?Text;
  };

  type EmailUserRecord = {
    passwordHash : Text;
    profile : CustomerProfile;
  };

  type RegisterEmailUserArgs = {
    email : Text;
    password : Text;
    companyName : Text;
    gstNumber : Text;
    address : Text;
    phone : Text;
    contactName : Text;
  };

  type RegisterEmailUserResult = {
    #ok;
    #errEmailTaken : Text;
    #errInvalid : Text;
  };

  type LoginEmailUserArgs = {
    email : Text;
    password : Text;
  };

  type LoginEmailUserResult = {
    #ok : CustomerProfile;
    #errNotFound : Text;
    #errWrongPassword : Text;
  };

  type EmailProfileUpdateArgs = {
    email : Text;
    password : Text;
    profile : CustomerProfile;
  };

  type UpdateEmailUserProfileResult = {
    #ok;
    #errNotFound : Text;
    #errWrongPassword : Text;
  };

  type GetEmailUserProfileArgs = {
    email : Text;
    password : Text;
  };

  type GetEmailUserProfileResult = {
    #ok : CustomerProfile;
    #errNotFound : Text;
    #errWrongPassword : Text;
  };

  type AdminLoginResult = {
    #ok;
    #errInvalid : Text;
  };

  type ActionResult = {
    #ok;
    #err : Text;
  };

  // --- Stable storage ---
  // quoteRequests holds old V1 data on upgrade; migrated to quoteRequestsV2 in postupgrade
  stable var quoteRequests : Map.Map<Nat, QuoteRequestV1> = Map.empty();
  stable var quoteRequestsV2 : Map.Map<Nat, QuoteRequest> = Map.empty();
  stable var qrMigrated : Bool = false;

  stable var customerProfiles = Map.empty<Principal, CustomerProfile>();
  stable var emailUsers = Map.empty<Text, EmailUserRecord>();
  stable var emailRequestOwners = Map.empty<Nat, Text>();
  stable var quotations = Map.empty<Nat, Quotation>();
  stable var orders = Map.empty<Nat, OrderRecord>();
  stable var nextRequestId = 1;
  stable var testAccountSeeded = false;

  // Migration from V1 to V2
  system func postupgrade() {
    if (not qrMigrated) {
      for (entry in quoteRequests.toArray().vals()) {
        let v = entry.1;
        let newReq : QuoteRequest = {
          id = v.id;
          customerId = v.customerId;
          boxType = v.boxType;
          length = v.length;
          width = v.width;
          height = v.height;
          material = v.material;
          quantity = v.quantity;
          drawingFileId = v.drawingFileId;
          deliveryLocation = v.deliveryLocation;
          status = v.status;
          createdAt = v.createdAt;
          adminNotes = v.adminNotes;
          declineReason = null;
          advancePaymentNotified = false;
          finalPaymentNotified = false;
          deliveryDetails = null;
        };
        quoteRequestsV2.add(v.id, newReq);
      };
      quoteRequests := Map.empty();
      qrMigrated := true;
    };
  };

  // Seed test customer account on first deployment
  if (not testAccountSeeded) {
    let testProfile : CustomerProfile = {
      companyName = "Cargivo Test Company";
      gstNumber = "27AABCT3518Q1ZL";
      address = "400001 | Maharashtra | Mumbai | Near CST Station | Cargivo House | Shop 5";
      phone = "9876543210";
      contactName = "Test Customer";
      email = "customer@cargivo.com";
    };
    let testRecord : EmailUserRecord = {
      passwordHash = "Cargivo@2023";
      profile = testProfile;
    };
    emailUsers.add("customer@cargivo.com", testRecord);

    let emailPrincipal = Principal.fromText("2vxsx-fae");
    let sampleRequest : QuoteRequest = {
      id = 1;
      customerId = emailPrincipal;
      boxType = "Wooden";
      length = 24.0;
      width = 18.0;
      height = 12.0;
      material = "";
      quantity = 50;
      drawingFileId = null;
      deliveryLocation = "400001 | Maharashtra | Mumbai | Andheri East | Cargivo House | Shop 5";
      status = "pending_quote";
      createdAt = 1710000000000000000;
      adminNotes = null;
      declineReason = null;
      advancePaymentNotified = false;
      finalPaymentNotified = false;
      deliveryDetails = null;
    };
    quoteRequestsV2.add(1, sampleRequest);
    emailRequestOwners.add(1, "customer@cargivo.com");
    nextRequestId := 2;
    testAccountSeeded := true;
  };

  //-------------- Helpers ----------------//

  func isAdminCredentials(email : Text, password : Text) : Bool {
    (email == adminEmail and password == adminPassword) or
    (email == admin2Email and password == admin2Password);
  };

  func verifyEmailUser(email : Text, password : Text) : Bool {
    switch (emailUsers.get(email)) {
      case (null) { false };
      case (?record) { record.passwordHash == password };
    };
  };

  func ownsRequest(email : Text, requestId : Nat) : Bool {
    switch (emailRequestOwners.get(requestId)) {
      case (?ownerEmail) { ownerEmail == email };
      case (null) { false };
    };
  };

  func updateReqStatus(request : QuoteRequest, newStatus : Text) : QuoteRequest {
    {
      id = request.id;
      customerId = request.customerId;
      boxType = request.boxType;
      length = request.length;
      width = request.width;
      height = request.height;
      material = request.material;
      quantity = request.quantity;
      drawingFileId = request.drawingFileId;
      deliveryLocation = request.deliveryLocation;
      status = newStatus;
      createdAt = request.createdAt;
      adminNotes = request.adminNotes;
      declineReason = request.declineReason;
      advancePaymentNotified = request.advancePaymentNotified;
      finalPaymentNotified = request.finalPaymentNotified;
      deliveryDetails = request.deliveryDetails;
    };
  };

  //-------------- Admin Auth ----------------//

  public shared func verifyAdminLogin(email : Text, password : Text) : async AdminLoginResult {
    if (isAdminCredentials(email, password)) { #ok } else { #errInvalid("Invalid admin credentials") };
  };

  public shared func changeAdminPassword(email : Text, oldPassword : Text, newPassword : Text) : async AdminLoginResult {
    if (not isAdminCredentials(email, oldPassword)) {
      return #errInvalid("Current credentials are incorrect");
    };
    adminPassword := newPassword;
    #ok;
  };

  public shared func clearAllDataAdmin(email : Text, password : Text) : async () {
    if (not isAdminCredentials(email, password)) {
      Runtime.trap("Unauthorized: Invalid admin credentials");
    };
    emailUsers := Map.empty<Text, EmailUserRecord>();
    customerProfiles := Map.empty<Principal, CustomerProfile>();
    quoteRequestsV2 := Map.empty<Nat, QuoteRequest>();
    quotations := Map.empty<Nat, Quotation>();
    orders := Map.empty<Nat, OrderRecord>();
    emailRequestOwners := Map.empty<Nat, Text>();
    nextRequestId := 1;
    testAccountSeeded := false;
  };

  //-------------- Admin Query/Action APIs ----------------//

  public query func getAllQuoteRequestsAdmin(email : Text, password : Text) : async [QuoteRequest] {
    if (not isAdminCredentials(email, password)) {
      Runtime.trap("Unauthorized: Invalid admin credentials");
    };
    quoteRequestsV2.values().toArray();
  };

  public query func getAllCustomersAdmin(email : Text, password : Text) : async [(Principal, CustomerProfile)] {
    if (not isAdminCredentials(email, password)) {
      Runtime.trap("Unauthorized: Invalid admin credentials");
    };
    let arr = customerProfiles.toArray();
    arr.sort(func(a, b) { CustomerProfile.compareByCompanyName(a.1, b.1) });
  };

  public query func getAllEmailCustomersAdmin(email : Text, password : Text) : async [CustomerProfile] {
    if (not isAdminCredentials(email, password)) {
      Runtime.trap("Unauthorized: Invalid admin credentials");
    };
    emailUsers.values().toArray().map(func(r : EmailUserRecord) : CustomerProfile { r.profile });
  };

  public shared func sendQuotationAdmin(email : Text, password : Text, args : QuotationArgs) : async () {
    if (not isAdminCredentials(email, password)) {
      Runtime.trap("Unauthorized: Invalid admin credentials");
    };
    let request = switch (quoteRequestsV2.get(args.requestId)) {
      case (null) { Runtime.trap("Quote request not found") };
      case (?r) { r };
    };
    let totalPrice = args.basePrice + args.deliveryCharge + (args.basePrice * (args.gstPercent / 100.0));
    let quotation : Quotation = {
      requestId = args.requestId;
      basePrice = args.basePrice;
      gstPercent = args.gstPercent;
      totalPrice;
      deliveryCharge = args.deliveryCharge;
      validUntil = args.validUntil;
      notes = args.notes;
      sentAt = Time.now();
    };
    quotations.add(args.requestId, quotation);
    quoteRequestsV2.add(args.requestId, updateReqStatus(request, "quote_sent"));
  };

  public shared func markAdvancePaidAdmin(email : Text, password : Text, requestId : Nat) : async () {
    if (not isAdminCredentials(email, password)) {
      Runtime.trap("Unauthorized: Invalid admin credentials");
    };
    let request = switch (quoteRequestsV2.get(requestId)) {
      case (null) { Runtime.trap("Quote request not found") };
      case (?r) { r };
    };
    quoteRequestsV2.add(requestId, updateReqStatus(request, "advance_paid"));
    let existingOrder = orders.get(requestId);
    let order : OrderRecord = switch (existingOrder) {
      case (null) { { requestId; customerId = request.customerId; advancePaid = true; finalPaid = false; manufacturingNotes = null; deliveryTrackingInfo = null } };
      case (?o) { { requestId = o.requestId; customerId = o.customerId; advancePaid = true; finalPaid = o.finalPaid; manufacturingNotes = o.manufacturingNotes; deliveryTrackingInfo = o.deliveryTrackingInfo } };
    };
    orders.add(requestId, order);
  };

  public shared func updateOrderStatusAdmin(email : Text, password : Text, args : OrderUpdateArgs) : async () {
    if (not isAdminCredentials(email, password)) {
      Runtime.trap("Unauthorized: Invalid admin credentials");
    };
    let request = switch (quoteRequestsV2.get(args.requestId)) {
      case (null) { Runtime.trap("Quote request not found") };
      case (?r) { r };
    };
    let status = if (args.deliveryTrackingInfo != null) { "delivered" } else if (args.manufacturingNotes != null) { "in_production" } else { "completed" };
    quoteRequestsV2.add(args.requestId, updateReqStatus(request, status));
    let existingOrder = switch (orders.get(args.requestId)) {
      case (null) { { requestId = args.requestId; customerId = request.customerId; advancePaid = false; finalPaid = false; manufacturingNotes = args.manufacturingNotes; deliveryTrackingInfo = args.deliveryTrackingInfo } };
      case (?o) { { requestId = o.requestId; customerId = o.customerId; advancePaid = o.advancePaid; finalPaid = o.finalPaid; manufacturingNotes = args.manufacturingNotes; deliveryTrackingInfo = args.deliveryTrackingInfo } };
    };
    orders.add(args.requestId, existingOrder);
  };

  public query func getOrderAdmin(email : Text, password : Text, requestId : Nat) : async ?OrderRecord {
    if (not isAdminCredentials(email, password)) {
      Runtime.trap("Unauthorized: Invalid admin credentials");
    };
    orders.get(requestId);
  };

  public shared func updateRequestStatusAdmin(email : Text, password : Text, requestId : Nat, status : Text) : async () {
    if (not isAdminCredentials(email, password)) {
      Runtime.trap("Unauthorized: Invalid admin credentials");
    };
    let request = switch (quoteRequestsV2.get(requestId)) {
      case (null) { Runtime.trap("Quote request not found") };
      case (?r) { r };
    };
    quoteRequestsV2.add(requestId, updateReqStatus(request, status));
  };

  public shared func confirmAdvancePaymentAdmin(email : Text, password : Text, requestId : Nat) : async ActionResult {
    if (not isAdminCredentials(email, password)) { return #err("Unauthorized") };
    let request = switch (quoteRequestsV2.get(requestId)) {
      case (null) { return #err("Request not found") };
      case (?r) { r };
    };
    quoteRequestsV2.add(requestId, updateReqStatus(request, "order_preparing"));
    let existingOrder = orders.get(requestId);
    let order : OrderRecord = switch (existingOrder) {
      case (null) { { requestId; customerId = request.customerId; advancePaid = true; finalPaid = false; manufacturingNotes = null; deliveryTrackingInfo = null } };
      case (?o) { { requestId = o.requestId; customerId = o.customerId; advancePaid = true; finalPaid = o.finalPaid; manufacturingNotes = o.manufacturingNotes; deliveryTrackingInfo = o.deliveryTrackingInfo } };
    };
    orders.add(requestId, order);
    #ok;
  };

  public shared func setInTransitAdmin(email : Text, password : Text, requestId : Nat, deliveryDetails : Text) : async ActionResult {
    if (not isAdminCredentials(email, password)) { return #err("Unauthorized") };
    let request = switch (quoteRequestsV2.get(requestId)) {
      case (null) { return #err("Request not found") };
      case (?r) { r };
    };
    let updated : QuoteRequest = {
      id = request.id; customerId = request.customerId; boxType = request.boxType;
      length = request.length; width = request.width; height = request.height;
      material = request.material; quantity = request.quantity;
      drawingFileId = request.drawingFileId; deliveryLocation = request.deliveryLocation;
      status = "in_transit"; createdAt = request.createdAt; adminNotes = request.adminNotes;
      declineReason = request.declineReason; advancePaymentNotified = request.advancePaymentNotified;
      finalPaymentNotified = request.finalPaymentNotified; deliveryDetails = ?deliveryDetails;
    };
    quoteRequestsV2.add(requestId, updated);
    #ok;
  };

  public shared func confirmDeliveredAdmin(email : Text, password : Text, requestId : Nat) : async ActionResult {
    if (not isAdminCredentials(email, password)) { return #err("Unauthorized") };
    let request = switch (quoteRequestsV2.get(requestId)) {
      case (null) { return #err("Request not found") };
      case (?r) { r };
    };
    quoteRequestsV2.add(requestId, updateReqStatus(request, "delivered"));
    #ok;
  };

  public shared func confirmFinalPaymentAdmin(email : Text, password : Text, requestId : Nat) : async ActionResult {
    if (not isAdminCredentials(email, password)) { return #err("Unauthorized") };
    let request = switch (quoteRequestsV2.get(requestId)) {
      case (null) { return #err("Request not found") };
      case (?r) { r };
    };
    let updated : QuoteRequest = {
      id = request.id; customerId = request.customerId; boxType = request.boxType;
      length = request.length; width = request.width; height = request.height;
      material = request.material; quantity = request.quantity;
      drawingFileId = request.drawingFileId; deliveryLocation = request.deliveryLocation;
      status = "completed"; createdAt = request.createdAt; adminNotes = request.adminNotes;
      declineReason = request.declineReason; advancePaymentNotified = request.advancePaymentNotified;
      finalPaymentNotified = true; deliveryDetails = request.deliveryDetails;
    };
    quoteRequestsV2.add(requestId, updated);
    let existingOrder = orders.get(requestId);
    let order : OrderRecord = switch (existingOrder) {
      case (null) { { requestId; customerId = request.customerId; advancePaid = true; finalPaid = true; manufacturingNotes = null; deliveryTrackingInfo = null } };
      case (?o) { { requestId = o.requestId; customerId = o.customerId; advancePaid = o.advancePaid; finalPaid = true; manufacturingNotes = o.manufacturingNotes; deliveryTrackingInfo = o.deliveryTrackingInfo } };
    };
    orders.add(requestId, order);
    #ok;
  };

  //-------------- Principal-based APIs ----------------//

  public query ({ caller }) func getCallerUserProfile() : async ?CustomerProfile {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized");
    };
    customerProfiles.get(caller);
  };

  public query ({ caller }) func getUserProfile(user : Principal) : async ?CustomerProfile {
    if (caller != user and not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized");
    };
    customerProfiles.get(user);
  };

  public shared ({ caller }) func saveCallerUserProfile(profile : CustomerProfile) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized");
    };
    customerProfiles.add(caller, profile);
  };

  public shared ({ caller }) func registerCustomerProfile(args : RegisterCustomerProfileArgs) : async () {
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("Unauthorized");
    };
    let profile : CustomerProfile = {
      companyName = args.companyName; gstNumber = args.gstNumber;
      address = args.address; phone = args.phone;
      contactName = args.contactName; email = args.email;
    };
    customerProfiles.add(caller, profile);
  };

  public query ({ caller }) func getMyProfile() : async ?CustomerProfile {
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("Unauthorized");
    };
    customerProfiles.get(caller);
  };

  public shared ({ caller }) func submitQuoteRequest(args : QuoteRequestArgs) : async Nat {
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("Unauthorized");
    };
    let id = nextRequestId;
    nextRequestId += 1;
    let request : QuoteRequest = {
      id; customerId = caller; boxType = args.boxType;
      length = args.length; width = args.width; height = args.height;
      material = args.material; quantity = args.quantity;
      drawingFileId = args.drawingFileId; deliveryLocation = args.deliveryLocation;
      status = "pending_quote"; createdAt = Time.now(); adminNotes = null;
      declineReason = null; advancePaymentNotified = false;
      finalPaymentNotified = false; deliveryDetails = null;
    };
    quoteRequestsV2.add(id, request);
    id;
  };

  public query ({ caller }) func getMyQuoteRequests() : async [QuoteRequest] {
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("Unauthorized");
    };
    quoteRequestsV2.values().toArray().filter(func(r) { r.customerId == caller });
  };

  public query ({ caller }) func getAllQuoteRequests() : async [QuoteRequest] {
    if (not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized");
    };
    quoteRequestsV2.values().toArray();
  };

  public shared ({ caller }) func sendQuotation(args : QuotationArgs) : async () {
    if (not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized");
    };
    let request = switch (quoteRequestsV2.get(args.requestId)) {
      case (null) { Runtime.trap("Not found") };
      case (?r) { r };
    };
    let totalPrice = args.basePrice + args.deliveryCharge + (args.basePrice * (args.gstPercent / 100.0));
    let quotation : Quotation = {
      requestId = args.requestId; basePrice = args.basePrice; gstPercent = args.gstPercent;
      totalPrice; deliveryCharge = args.deliveryCharge; validUntil = args.validUntil;
      notes = args.notes; sentAt = Time.now();
    };
    quotations.add(args.requestId, quotation);
    quoteRequestsV2.add(args.requestId, updateReqStatus(request, "quote_sent"));
  };

  public query ({ caller }) func getQuotation(requestId : Nat) : async ?Quotation {
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("Unauthorized");
    };
    quotations.get(requestId);
  };

  public shared ({ caller }) func approveQuote(requestId : Nat) : async () {
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("Unauthorized");
    };
    let request = switch (quoteRequestsV2.get(requestId)) {
      case (null) { Runtime.trap("Not found") };
      case (?r) { r };
    };
    if (request.customerId != caller) { Runtime.trap("Unauthorized") };
    quoteRequestsV2.add(requestId, updateReqStatus(request, "customer_accepted"));
  };

  public shared ({ caller }) func rejectQuote(requestId : Nat) : async () {
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("Unauthorized");
    };
    let request = switch (quoteRequestsV2.get(requestId)) {
      case (null) { Runtime.trap("Not found") };
      case (?r) { r };
    };
    if (request.customerId != caller) { Runtime.trap("Unauthorized") };
    quoteRequestsV2.add(requestId, updateReqStatus(request, "customer_declined"));
  };

  public shared ({ caller }) func markAdvancePaid(requestId : Nat) : async () {
    if (not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized");
    };
    let request = switch (quoteRequestsV2.get(requestId)) {
      case (null) { Runtime.trap("Not found") };
      case (?r) { r };
    };
    quoteRequestsV2.add(requestId, updateReqStatus(request, "advance_paid"));
    let order : OrderRecord = { requestId; customerId = request.customerId; advancePaid = true; finalPaid = false; manufacturingNotes = null; deliveryTrackingInfo = null };
    orders.add(requestId, order);
  };

  public shared ({ caller }) func updateOrderStatus(args : OrderUpdateArgs) : async () {
    if (not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized");
    };
    let request = switch (quoteRequestsV2.get(args.requestId)) {
      case (null) { Runtime.trap("Not found") };
      case (?r) { r };
    };
    let status = if (args.manufacturingNotes != null and args.deliveryTrackingInfo == null) { "in_production" }
      else if (args.deliveryTrackingInfo != null) { "delivered" } else { "completed" };
    quoteRequestsV2.add(args.requestId, updateReqStatus(request, status));
    let existingOrder = switch (orders.get(args.requestId)) {
      case (null) { Runtime.trap("Order not found") };
      case (?o) { o };
    };
    orders.add(args.requestId, { requestId = existingOrder.requestId; customerId = existingOrder.customerId; advancePaid = existingOrder.advancePaid; finalPaid = existingOrder.finalPaid; manufacturingNotes = args.manufacturingNotes; deliveryTrackingInfo = args.deliveryTrackingInfo });
  };

  public query ({ caller }) func getOrder(requestId : Nat) : async ?OrderRecord {
    let order = orders.get(requestId);
    switch (order) {
      case (null) { null };
      case (?o) {
        if (o.customerId == caller or AccessControl.isAdmin(accessControlState, caller)) { ?o }
        else { Runtime.trap("Unauthorized") };
      };
    };
  };

  public query ({ caller }) func getAllCustomers() : async [(Principal, CustomerProfile)] {
    if (not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized");
    };
    let arr = customerProfiles.toArray();
    arr.sort(func(a, b) { CustomerProfile.compareByCompanyName(a.1, b.1) });
  };

  public query ({ caller }) func getInvoiceData(requestId : Nat) : async ?InvoiceData {
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("Unauthorized");
    };
    let request = switch (quoteRequestsV2.get(requestId)) {
      case (null) { return null };
      case (?r) { r };
    };
    if (request.customerId != caller and not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized");
    };
    let quotation = switch (quotations.get(requestId)) { case (null) { return null }; case (?q) { q } };
    let customer = switch (customerProfiles.get(request.customerId)) { case (null) { return null }; case (?c) { c } };
    ?{ request; quotation; customer };
  };

  //-------------- Email User Management ----------------//

  public shared ({ caller }) func registerEmailUser(args : RegisterEmailUserArgs) : async RegisterEmailUserResult {
    switch (emailUsers.get(args.email)) {
      case (null) {
        let profile : CustomerProfile = {
          companyName = args.companyName; gstNumber = args.gstNumber;
          address = args.address; phone = args.phone;
          contactName = args.contactName; email = args.email;
        };
        emailUsers.add(args.email, { passwordHash = args.password; profile });
        #ok;
      };
      case (?_) { #errEmailTaken("Email is already in use") };
    };
  };

  public shared ({ caller }) func loginEmailUser(args : LoginEmailUserArgs) : async LoginEmailUserResult {
    switch (emailUsers.get(args.email)) {
      case (null) { #errNotFound("Email not found") };
      case (?record) {
        if (record.passwordHash == args.password) { #ok(record.profile) }
        else { #errWrongPassword("Incorrect password") };
      };
    };
  };

  public shared ({ caller }) func updateEmailUserProfile(args : EmailProfileUpdateArgs) : async UpdateEmailUserProfileResult {
    switch (emailUsers.get(args.email)) {
      case (null) { #errNotFound("Email not found") };
      case (?record) {
        if (record.passwordHash == args.password) {
          emailUsers.add(args.email, { passwordHash = record.passwordHash; profile = args.profile });
          #ok;
        } else { #errWrongPassword("Incorrect password") };
      };
    };
  };

  public shared ({ caller }) func getEmailUserProfile(args : GetEmailUserProfileArgs) : async GetEmailUserProfileResult {
    switch (emailUsers.get(args.email)) {
      case (null) { #errNotFound("Email not found") };
      case (?record) {
        if (record.passwordHash == args.password) { #ok(record.profile) }
        else { #errWrongPassword("Incorrect password") };
      };
    };
  };

  public shared func submitQuoteRequestWithEmail(email : Text, password : Text, args : QuoteRequestArgs) : async Nat {
    switch (emailUsers.get(email)) {
      case (null) { Runtime.trap("Email not found") };
      case (?record) {
        if (record.passwordHash != password) { Runtime.trap("Wrong password") };
        let id = nextRequestId;
        nextRequestId += 1;
        let emailPrincipal = Principal.fromText("2vxsx-fae");
        let request : QuoteRequest = {
          id; customerId = emailPrincipal; boxType = args.boxType;
          length = args.length; width = args.width; height = args.height;
          material = args.material; quantity = args.quantity;
          drawingFileId = args.drawingFileId; deliveryLocation = args.deliveryLocation;
          status = "pending_quote"; createdAt = Time.now(); adminNotes = null;
          declineReason = null; advancePaymentNotified = false;
          finalPaymentNotified = false; deliveryDetails = null;
        };
        quoteRequestsV2.add(id, request);
        emailRequestOwners.add(id, email);
        id;
      };
    };
  };

  public query func getMyQuoteRequestsWithEmail(email : Text, password : Text) : async [QuoteRequest] {
    switch (emailUsers.get(email)) {
      case (null) { Runtime.trap("Email not found") };
      case (?record) {
        if (record.passwordHash != password) { Runtime.trap("Wrong password") };
        quoteRequestsV2.values().toArray().filter(
          func(request) {
            switch (emailRequestOwners.get(request.id)) {
              case (?ownerEmail) { ownerEmail == email };
              case (null) { false };
            };
          }
        );
      };
    };
  };

  public shared func acceptQuotationWithEmail(email : Text, password : Text, requestId : Nat) : async ActionResult {
    if (not verifyEmailUser(email, password)) { return #err("Invalid credentials") };
    if (not ownsRequest(email, requestId)) { return #err("Not authorized") };
    let request = switch (quoteRequestsV2.get(requestId)) {
      case (null) { return #err("Request not found") };
      case (?r) { r };
    };
    quoteRequestsV2.add(requestId, updateReqStatus(request, "customer_accepted"));
    #ok;
  };

  public shared func declineQuotationWithEmail(email : Text, password : Text, requestId : Nat, reason : Text) : async ActionResult {
    if (not verifyEmailUser(email, password)) { return #err("Invalid credentials") };
    if (not ownsRequest(email, requestId)) { return #err("Not authorized") };
    let request = switch (quoteRequestsV2.get(requestId)) {
      case (null) { return #err("Request not found") };
      case (?r) { r };
    };
    let updated : QuoteRequest = {
      id = request.id; customerId = request.customerId; boxType = request.boxType;
      length = request.length; width = request.width; height = request.height;
      material = request.material; quantity = request.quantity;
      drawingFileId = request.drawingFileId; deliveryLocation = request.deliveryLocation;
      status = "customer_declined"; createdAt = request.createdAt; adminNotes = request.adminNotes;
      declineReason = ?reason; advancePaymentNotified = request.advancePaymentNotified;
      finalPaymentNotified = request.finalPaymentNotified; deliveryDetails = request.deliveryDetails;
    };
    quoteRequestsV2.add(requestId, updated);
    #ok;
  };

  public shared func notifyAdvancePaymentWithEmail(email : Text, password : Text, requestId : Nat) : async ActionResult {
    if (not verifyEmailUser(email, password)) { return #err("Invalid credentials") };
    if (not ownsRequest(email, requestId)) { return #err("Not authorized") };
    let request = switch (quoteRequestsV2.get(requestId)) {
      case (null) { return #err("Request not found") };
      case (?r) { r };
    };
    let updated : QuoteRequest = {
      id = request.id; customerId = request.customerId; boxType = request.boxType;
      length = request.length; width = request.width; height = request.height;
      material = request.material; quantity = request.quantity;
      drawingFileId = request.drawingFileId; deliveryLocation = request.deliveryLocation;
      status = "advance_payment_pending"; createdAt = request.createdAt; adminNotes = request.adminNotes;
      declineReason = request.declineReason; advancePaymentNotified = true;
      finalPaymentNotified = request.finalPaymentNotified; deliveryDetails = request.deliveryDetails;
    };
    quoteRequestsV2.add(requestId, updated);
    #ok;
  };

  public shared func notifyFinalPaymentWithEmail(email : Text, password : Text, requestId : Nat) : async ActionResult {
    if (not verifyEmailUser(email, password)) { return #err("Invalid credentials") };
    if (not ownsRequest(email, requestId)) { return #err("Not authorized") };
    let request = switch (quoteRequestsV2.get(requestId)) {
      case (null) { return #err("Request not found") };
      case (?r) { r };
    };
    let updated : QuoteRequest = {
      id = request.id; customerId = request.customerId; boxType = request.boxType;
      length = request.length; width = request.width; height = request.height;
      material = request.material; quantity = request.quantity;
      drawingFileId = request.drawingFileId; deliveryLocation = request.deliveryLocation;
      status = request.status; createdAt = request.createdAt; adminNotes = request.adminNotes;
      declineReason = request.declineReason; advancePaymentNotified = request.advancePaymentNotified;
      finalPaymentNotified = true; deliveryDetails = request.deliveryDetails;
    };
    quoteRequestsV2.add(requestId, updated);
    #ok;
  };

  public query func getQuotationByEmailUser(email : Text, password : Text, requestId : Nat) : async ?Quotation {
    switch (emailUsers.get(email)) {
      case (null) { Runtime.trap("Email not found") };
      case (?record) {
        if (record.passwordHash != password) { Runtime.trap("Wrong password") };
        if (not ownsRequest(email, requestId)) { Runtime.trap("Not authorized") };
        quotations.get(requestId);
      };
    };
  };

  public query func getInvoiceDataByEmail(email : Text, password : Text, requestId : Nat) : async ?InvoiceData {
    switch (emailUsers.get(email)) {
      case (null) { Runtime.trap("Email not found") };
      case (?record) {
        if (record.passwordHash != password) { Runtime.trap("Wrong password") };
        if (not ownsRequest(email, requestId)) { Runtime.trap("Not authorized") };
        let request = switch (quoteRequestsV2.get(requestId)) {
          case (null) { return null };
          case (?r) { r };
        };
        let quotation = switch (quotations.get(requestId)) { case (null) { return null }; case (?q) { q } };
        ?{ request; quotation; customer = record.profile };
      };
    };
  };

};
