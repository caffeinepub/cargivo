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

  // Admin credentials (default: admin@cargivo.com / Cargivo@2024)
  stable var adminEmail : Text = "admin@cargivo.com";
  stable var adminPassword : Text = "Cargivo@2024";

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

  type Order = {
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

  stable var customerProfiles = Map.empty<Principal, CustomerProfile>();
  stable var emailUsers = Map.empty<Text, EmailUserRecord>();
  stable var emailRequestOwners = Map.empty<Nat, Text>(); // requestId -> email
  stable var quoteRequests = Map.empty<Nat, QuoteRequest>();
  stable var quotations = Map.empty<Nat, Quotation>();
  stable var orders = Map.empty<Nat, Order>();
  stable var nextRequestId = 1;
  stable var testAccountSeeded = false;

  // Seed test customer account on first deployment
  if (not testAccountSeeded) {
    let testProfile : CustomerProfile = {
      companyName = "Test Company Pvt Ltd";
      gstNumber = "27AAACT2727Q1Z5";
      address = "400001 | Maharashtra | Mumbai | Near Station | Test Building | Shop 1";
      phone = "9876543210";
      contactName = "Test User";
      email = "test@cargivo.com";
    };
    let testRecord : EmailUserRecord = {
      passwordHash = "Test@1234";
      profile = testProfile;
    };
    emailUsers.add("test@cargivo.com", testRecord);
    testAccountSeeded := true;
  };

  //-------------- Admin Email Auth Helpers ----------------//

  func isAdminCredentials(email : Text, password : Text) : Bool {
    email == adminEmail and password == adminPassword;
  };

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

  //-------------- Admin-password versions of admin APIs ----------------//

  public query func getAllQuoteRequestsAdmin(email : Text, password : Text) : async [QuoteRequest] {
    if (not isAdminCredentials(email, password)) {
      Runtime.trap("Unauthorized: Invalid admin credentials");
    };
    quoteRequests.values().toArray();
  };

  public query func getAllCustomersAdmin(email : Text, password : Text) : async [(Principal, CustomerProfile)] {
    if (not isAdminCredentials(email, password)) {
      Runtime.trap("Unauthorized: Invalid admin credentials");
    };
    let customerArray = customerProfiles.toArray();
    customerArray.sort(
      func(a, b) { CustomerProfile.compareByCompanyName(a.1, b.1) }
    );
  };

  // Also include email-registered customers
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
    let request = switch (quoteRequests.get(args.requestId)) {
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
    let updatedRequest : QuoteRequest = {
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
      status = "quote_sent";
      createdAt = request.createdAt;
      adminNotes = request.adminNotes;
    };
    quoteRequests.add(args.requestId, updatedRequest);
  };

  public shared func markAdvancePaidAdmin(email : Text, password : Text, requestId : Nat) : async () {
    if (not isAdminCredentials(email, password)) {
      Runtime.trap("Unauthorized: Invalid admin credentials");
    };
    let request = switch (quoteRequests.get(requestId)) {
      case (null) { Runtime.trap("Quote request not found") };
      case (?r) { r };
    };
    let updatedRequest : QuoteRequest = {
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
      status = "advance_paid";
      createdAt = request.createdAt;
      adminNotes = request.adminNotes;
    };
    quoteRequests.add(requestId, updatedRequest);
    let existingOrder = orders.get(requestId);
    let order : Order = switch (existingOrder) {
      case (null) {
        {
          requestId;
          customerId = request.customerId;
          advancePaid = true;
          finalPaid = false;
          manufacturingNotes = null;
          deliveryTrackingInfo = null;
        };
      };
      case (?o) {
        {
          requestId = o.requestId;
          customerId = o.customerId;
          advancePaid = true;
          finalPaid = o.finalPaid;
          manufacturingNotes = o.manufacturingNotes;
          deliveryTrackingInfo = o.deliveryTrackingInfo;
        };
      };
    };
    orders.add(requestId, order);
  };

  public shared func updateOrderStatusAdmin(email : Text, password : Text, args : OrderUpdateArgs) : async () {
    if (not isAdminCredentials(email, password)) {
      Runtime.trap("Unauthorized: Invalid admin credentials");
    };
    let request = switch (quoteRequests.get(args.requestId)) {
      case (null) { Runtime.trap("Quote request not found") };
      case (?r) { r };
    };
    let status = if (args.deliveryTrackingInfo != null) {
      "delivered";
    } else if (args.manufacturingNotes != null) {
      "in_production";
    } else {
      "completed";
    };
    let updatedRequest : QuoteRequest = {
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
      status;
      createdAt = request.createdAt;
      adminNotes = request.adminNotes;
    };
    quoteRequests.add(args.requestId, updatedRequest);
    let existingOrder = switch (orders.get(args.requestId)) {
      case (null) {
        {
          requestId = args.requestId;
          customerId = request.customerId;
          advancePaid = false;
          finalPaid = false;
          manufacturingNotes = args.manufacturingNotes;
          deliveryTrackingInfo = args.deliveryTrackingInfo;
        };
      };
      case (?o) {
        {
          requestId = o.requestId;
          customerId = o.customerId;
          advancePaid = o.advancePaid;
          finalPaid = o.finalPaid;
          manufacturingNotes = args.manufacturingNotes;
          deliveryTrackingInfo = args.deliveryTrackingInfo;
        };
      };
    };
    orders.add(args.requestId, existingOrder);
  };

  public query func getOrderAdmin(email : Text, password : Text, requestId : Nat) : async ?Order {
    if (not isAdminCredentials(email, password)) {
      Runtime.trap("Unauthorized: Invalid admin credentials");
    };
    orders.get(requestId);
  };

  public shared func updateRequestStatusAdmin(email : Text, password : Text, requestId : Nat, status : Text) : async () {
    if (not isAdminCredentials(email, password)) {
      Runtime.trap("Unauthorized: Invalid admin credentials");
    };
    let request = switch (quoteRequests.get(requestId)) {
      case (null) { Runtime.trap("Quote request not found") };
      case (?r) { r };
    };
    let updatedRequest : QuoteRequest = {
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
      status;
      createdAt = request.createdAt;
      adminNotes = request.adminNotes;
    };
    quoteRequests.add(requestId, updatedRequest);
  };

  //-------------- Original principal-based APIs (kept for II admin) ----------------//

  public query ({ caller }) func getCallerUserProfile() : async ?CustomerProfile {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view profiles");
    };
    customerProfiles.get(caller);
  };

  public query ({ caller }) func getUserProfile(user : Principal) : async ?CustomerProfile {
    if (caller != user and not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Can only view your own profile");
    };
    customerProfiles.get(user);
  };

  public shared ({ caller }) func saveCallerUserProfile(profile : CustomerProfile) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can save profiles");
    };
    customerProfiles.add(caller, profile);
  };

  public shared ({ caller }) func registerCustomerProfile(args : RegisterCustomerProfileArgs) : async () {
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("Unauthorized: Only users can register profiles");
    };
    let profile : CustomerProfile = {
      companyName = args.companyName;
      gstNumber = args.gstNumber;
      address = args.address;
      phone = args.phone;
      contactName = args.contactName;
      email = args.email;
    };
    customerProfiles.add(caller, profile);
  };

  public query ({ caller }) func getMyProfile() : async ?CustomerProfile {
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("Unauthorized: Only users can get profiles");
    };
    customerProfiles.get(caller);
  };

  public shared ({ caller }) func submitQuoteRequest(args : QuoteRequestArgs) : async Nat {
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("Unauthorized: Only users can submit quote requests");
    };
    let id = nextRequestId;
    nextRequestId += 1;
    let request : QuoteRequest = {
      id;
      customerId = caller;
      boxType = args.boxType;
      length = args.length;
      width = args.width;
      height = args.height;
      material = args.material;
      quantity = args.quantity;
      drawingFileId = args.drawingFileId;
      deliveryLocation = args.deliveryLocation;
      status = "pending_quote";
      createdAt = Time.now();
      adminNotes = null;
    };
    quoteRequests.add(id, request);
    id;
  };

  public query ({ caller }) func getMyQuoteRequests() : async [QuoteRequest] {
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("Unauthorized: Only users can get quote requests");
    };
    let resultArray = quoteRequests.values().toArray();
    resultArray.filter(
      func(request) {
        request.customerId == caller;
      }
    );
  };

  public query ({ caller }) func getAllQuoteRequests() : async [QuoteRequest] {
    if (not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Only admins can get all quote requests");
    };
    quoteRequests.values().toArray();
  };

  public shared ({ caller }) func sendQuotation(args : QuotationArgs) : async () {
    if (not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Only admins can send quotations");
    };
    let request = switch (quoteRequests.get(args.requestId)) {
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
    let updatedRequest : QuoteRequest = {
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
      status = "quote_sent";
      createdAt = request.createdAt;
      adminNotes = request.adminNotes;
    };
    quoteRequests.add(args.requestId, updatedRequest);
  };

  public query ({ caller }) func getQuotation(requestId : Nat) : async ?Quotation {
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("Unauthorized: Only users can get quotations");
    };
    let request = switch (quoteRequests.get(requestId)) {
      case (null) { return null };
      case (?r) { r };
    };
    if (request.customerId != caller and not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Cannot access someone else's quotation");
    };
    quotations.get(requestId);
  };

  public shared ({ caller }) func approveQuote(requestId : Nat) : async () {
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("Unauthorized: Only users can approve quotes");
    };
    let request = switch (quoteRequests.get(requestId)) {
      case (null) { Runtime.trap("Quote request not found") };
      case (?r) { r };
    };
    if (request.customerId != caller) {
      Runtime.trap("Unauthorized: Cannot approve someone else's quote");
    };
    let updatedRequest : QuoteRequest = {
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
      status = "approved";
      createdAt = request.createdAt;
      adminNotes = request.adminNotes;
    };
    quoteRequests.add(requestId, updatedRequest);
  };

  public shared ({ caller }) func rejectQuote(requestId : Nat) : async () {
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("Unauthorized: Only users can reject quotes");
    };
    let request = switch (quoteRequests.get(requestId)) {
      case (null) { Runtime.trap("Quote request not found") };
      case (?r) { r };
    };
    if (request.customerId != caller) {
      Runtime.trap("Unauthorized: Cannot reject someone else's quote");
    };
    let updatedRequest : QuoteRequest = {
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
      status = "rejected";
      createdAt = request.createdAt;
      adminNotes = request.adminNotes;
    };
    quoteRequests.add(requestId, updatedRequest);
  };

  public shared ({ caller }) func markAdvancePaid(requestId : Nat) : async () {
    if (not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Only admins can mark advance paid");
    };
    let request = switch (quoteRequests.get(requestId)) {
      case (null) { Runtime.trap("Quote request not found") };
      case (?r) { r };
    };
    let updatedRequest : QuoteRequest = {
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
      status = "advance_paid";
      createdAt = request.createdAt;
      adminNotes = request.adminNotes;
    };
    quoteRequests.add(requestId, updatedRequest);
    let order : Order = {
      requestId;
      customerId = request.customerId;
      advancePaid = true;
      finalPaid = false;
      manufacturingNotes = null;
      deliveryTrackingInfo = null;
    };
    orders.add(requestId, order);
  };

  public shared ({ caller }) func updateOrderStatus(args : OrderUpdateArgs) : async () {
    if (not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Only admins can update order status");
    };
    let request = switch (quoteRequests.get(args.requestId)) {
      case (null) { Runtime.trap("Quote request not found") };
      case (?r) { r };
    };
    let status = if (args.manufacturingNotes != null and args.deliveryTrackingInfo == null) {
      "in_production";
    } else if (args.deliveryTrackingInfo != null and args.manufacturingNotes != null) {
      "delivered";
    } else {
      "completed";
    };
    let updatedRequest : QuoteRequest = {
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
      status;
      createdAt = request.createdAt;
      adminNotes = request.adminNotes;
    };
    quoteRequests.add(args.requestId, updatedRequest);
    let existingOrder = switch (orders.get(args.requestId)) {
      case (null) { Runtime.trap("Order not found") };
      case (?o) { o };
    };
    let updatedOrder : Order = {
      requestId = existingOrder.requestId;
      customerId = existingOrder.customerId;
      advancePaid = existingOrder.advancePaid;
      finalPaid = existingOrder.finalPaid;
      manufacturingNotes = args.manufacturingNotes;
      deliveryTrackingInfo = args.deliveryTrackingInfo;
    };
    orders.add(args.requestId, updatedOrder);
  };

  public query ({ caller }) func getOrder(requestId : Nat) : async ?Order {
    let order = orders.get(requestId);
    switch (order) {
      case (null) { null };
      case (?o) {
        if (o.customerId == caller or AccessControl.isAdmin(accessControlState, caller)) {
          ?o;
        } else { Runtime.trap("Unauthorized: Cannot access this order") };
      };
    };
  };

  public query ({ caller }) func getAllCustomers() : async [(Principal, CustomerProfile)] {
    if (not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Only admins can get all customers");
    };
    let customerArray = customerProfiles.toArray();
    customerArray.sort(
      func(a, b) { CustomerProfile.compareByCompanyName(a.1, b.1) }
    );
  };

  public query ({ caller }) func getInvoiceData(requestId : Nat) : async ?InvoiceData {
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("Unauthorized: Only users can get invoice data");
    };
    let request = switch (quoteRequests.get(requestId)) {
      case (null) { return null };
      case (?r) { r };
    };
    if (request.customerId != caller and not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Cannot access someone else's invoice data");
    };
    let quotation = switch (quotations.get(requestId)) {
      case (null) { return null };
      case (?q) { q };
    };
    let customer = switch (customerProfiles.get(request.customerId)) {
      case (null) { return null };
      case (?c) { c };
    };
    ?{ request; quotation; customer };
  };

  //------------------- Email User Management -------------------//

  public shared ({ caller }) func registerEmailUser(args : RegisterEmailUserArgs) : async RegisterEmailUserResult {
    switch (emailUsers.get(args.email)) {
      case (null) {
        let profile : CustomerProfile = {
          companyName = args.companyName;
          gstNumber = args.gstNumber;
          address = args.address;
          phone = args.phone;
          contactName = args.contactName;
          email = args.email;
        };
        let record : EmailUserRecord = {
          passwordHash = args.password;
          profile;
        };
        emailUsers.add(args.email, record);
        #ok;
      };
      case (?_) { #errEmailTaken("Email is already in use") };
    };
  };

  public shared ({ caller }) func loginEmailUser(args : LoginEmailUserArgs) : async LoginEmailUserResult {
    switch (emailUsers.get(args.email)) {
      case (null) { #errNotFound("Email not found") };
      case (?record) {
        if (record.passwordHash == args.password) {
          #ok(record.profile);
        } else { #errWrongPassword("Incorrect password") };
      };
    };
  };

  public shared ({ caller }) func updateEmailUserProfile(args : EmailProfileUpdateArgs) : async UpdateEmailUserProfileResult {
    switch (emailUsers.get(args.email)) {
      case (null) { #errNotFound("Email not found") };
      case (?record) {
        if (record.passwordHash == args.password) {
          let updatedRecord : EmailUserRecord = {
            passwordHash = record.passwordHash;
            profile = args.profile;
          };
          emailUsers.add(args.email, updatedRecord);
          #ok;
        } else { #errWrongPassword("Incorrect password") };
      };
    };
  };

  public shared ({ caller }) func getEmailUserProfile(args : GetEmailUserProfileArgs) : async GetEmailUserProfileResult {
    switch (emailUsers.get(args.email)) {
      case (null) { #errNotFound("Email not found") };
      case (?record) {
        if (record.passwordHash == args.password) {
          #ok(record.profile);
        } else { #errWrongPassword("Incorrect password") };
      };
    };
  };

  // Email-authenticated quote request submission
  public shared func submitQuoteRequestWithEmail(email : Text, password : Text, args : QuoteRequestArgs) : async Nat {
    switch (emailUsers.get(email)) {
      case (null) { Runtime.trap("Email not found") };
      case (?record) {
        if (record.passwordHash != password) { Runtime.trap("Wrong password") };
        let id = nextRequestId;
        nextRequestId += 1;
        let emailPrincipal = Principal.fromText("2vxsx-fae");
        let request : QuoteRequest = {
          id;
          customerId = emailPrincipal;
          boxType = args.boxType;
          length = args.length;
          width = args.width;
          height = args.height;
          material = args.material;
          quantity = args.quantity;
          drawingFileId = args.drawingFileId;
          deliveryLocation = args.deliveryLocation;
          status = "pending_quote";
          createdAt = Time.now();
          adminNotes = null;
        };
        quoteRequests.add(id, request);
        emailRequestOwners.add(id, email);
        id;
      };
    };
  };

  // Email-authenticated get my quote requests
  public query func getMyQuoteRequestsWithEmail(email : Text, password : Text) : async [QuoteRequest] {
    switch (emailUsers.get(email)) {
      case (null) { Runtime.trap("Email not found") };
      case (?record) {
        if (record.passwordHash != password) { Runtime.trap("Wrong password") };
        let resultArray = quoteRequests.values().toArray();
        resultArray.filter(
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

};
