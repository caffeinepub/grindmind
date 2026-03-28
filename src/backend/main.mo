import Iter "mo:core/Iter";
import Time "mo:core/Time";
import Nat "mo:core/Nat";
import Principal "mo:core/Principal";
import Array "mo:core/Array";
import Map "mo:core/Map";
import Text "mo:core/Text";
import Runtime "mo:core/Runtime";


import AccessControl "authorization/access-control";
import MixinAuthorization "authorization/MixinAuthorization";
import MixinStorage "blob-storage/Mixin";


actor {
  include MixinStorage();

  type Profile = {
    name : Text;
    weight : Text;
    goal : Text;
  };

  type Stats = {
    xp : Nat;
    streak : Nat;
    lastCompletedDate : Text;
    noExcuseMode : Bool;
    soundEnabled : Bool;
  };

  type JournalEntry = {
    date : Text;
    conquered : Text;
    dominate : Text;
  };

  type StrengthLog = {
    date : Text;
    exercise : Text;
    weight : Float;
    sets : Nat;
    reps : Text;
  };

  type WeightEntry = {
    date : Text;
    weight : Float;
  };

  type Task = {
    date : Text;
    workout : Bool;
    water : Bool;
    meditation : Bool;
    diet : Bool;
    sleep : Bool;
  };

  type UserData = {
    profile : Profile;
    stats : Stats;
    achievements : [Text];
    journalEntries : [JournalEntry];
    strengthLogs : [StrengthLog];
    weightEntries : [WeightEntry];
    tasks : [Task];
  };

  // Custom UserProfile type for the frontend
  public type UserProfile = {
    name : Text;
    weight : Text;
    goal : Text;
  };

  type ProgressData = {
    tasksCompleted : Nat;
    streak : Nat;
    lastUpdated : Text;
  };

  type JournalEntryNew = {
    id : Text;
    date : Text;
    content : Text;
  };

  type UserInfo = {
    name : Text;
    email : Text;
  };
  // Initialize the access control system
  let accessControlState = AccessControl.initState();
  include MixinAuthorization(accessControlState);

  let users = Map.empty<Principal, UserData>();
  let userProfiles = Map.empty<Principal, UserProfile>();
  let usersNew = Map.empty<Principal, UserInfo>();
  let progress = Map.empty<Principal, ProgressData>();
  let journal = Map.empty<Principal, [JournalEntryNew]>();

  func mergeArrays<T>(existing : [T], newEntries : [T], maxSize : Nat) : [T] {
    let combined = newEntries.concat(existing);
    let sliceSize = Nat.min(combined.size(), maxSize);
    let result = Array.tabulate(sliceSize, func(i) { combined[i] });
    result;
  };

  // Required profile management functions
  public query ({ caller }) func getCallerUserProfile() : async ?UserProfile {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view profiles");
    };
    userProfiles.get(caller);
  };

  public query ({ caller }) func getUserProfile(user : Principal) : async ?UserProfile {
    if (caller != user and not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Can only view your own profile");
    };
    userProfiles.get(user);
  };

  public shared ({ caller }) func saveCallerUserProfile(profile : UserProfile) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can save profiles");
    };
    userProfiles.add(caller, profile);
  };

  public shared ({ caller }) func saveUserData(userData : UserData) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can save data");
    };

    let existingData = users.get(caller);
    let mergedData : UserData = switch (existingData) {
      case (null) {
        {
          userData with
          journalEntries = mergeArrays([], userData.journalEntries, 30);
          strengthLogs = mergeArrays([], userData.strengthLogs, 50);
          weightEntries = mergeArrays([], userData.weightEntries, 30);
          tasks = mergeArrays([], userData.tasks, 60);
        };
      };
      case (?existing) {
        {
          userData with
          journalEntries = mergeArrays(existing.journalEntries, userData.journalEntries, 30);
          strengthLogs = mergeArrays(existing.strengthLogs, userData.strengthLogs, 50);
          weightEntries = mergeArrays(existing.weightEntries, userData.weightEntries, 30);
          tasks = mergeArrays(existing.tasks, userData.tasks, 60);
        };
      };
    };

    users.add(caller, mergedData);

    // Sync profile data
    let profile : UserProfile = {
      name = userData.profile.name;
      weight = userData.profile.weight;
      goal = userData.profile.goal;
    };
    userProfiles.add(caller, profile);
  };

  public query ({ caller }) func getUserData() : async ?UserData {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view data");
    };
    users.get(caller);
  };

  public shared ({ caller }) func getAllUsers() : async [UserData] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can view all users");
    };
    users.values().toArray();
  };

  public query ({ caller }) func searchUserByName(name : Text) : async ?UserData {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can search users");
    };
    let usersIter = users.values();
    usersIter.find(
      func(userData) {
        userData.profile.name.contains(#text name);
      }
    );
  };

  public shared ({ caller }) func deleteUserData() : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can delete their own data");
    };
    users.remove(caller);
    userProfiles.remove(caller);
  };

  public shared ({ caller }) func updateUserStreak(streak : Nat) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can update their streak");
    };
    let userData = users.get(caller);
    switch (userData) {
      case (null) { Runtime.trap("User data not found") };
      case (?data) {
        let updatedStats = { data.stats with streak };
        let updatedData = { data with stats = updatedStats };
        users.add(caller, updatedData);
      };
    };
  };

  public shared ({ caller }) func deleteAllData() : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can reset all users");
    };
    // Clear all user data
    for (key in users.keys()) {
      users.remove(key);
    };
    for (key in userProfiles.keys()) {
      userProfiles.remove(key);
    };
  };

  public query ({ caller }) func getCurrentTime() : async Int {
    // No authorization needed - public utility function
    Time.now();
  };

  // new functions for users, progress and journal
  // #user role is required for user functions

  public shared ({ caller }) func saveUser(name : Text, email : Text) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can save users");
    };
    let userInfo = {
      name;
      email;
    };
    usersNew.add(caller, userInfo);
  };

  public query ({ caller }) func getUser() : async ?{ name : Text; email : Text } {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view user data");
    };
    usersNew.get(caller);
  };

  public shared ({ caller }) func saveProgress(tasksCompleted : Nat, streak : Nat, lastUpdated : Text) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can save progress");
    };
    let progressData = {
      tasksCompleted;
      streak;
      lastUpdated;
    };
    progress.add(caller, progressData);
  };

  public query ({ caller }) func getProgress() : async ?{ tasksCompleted : Nat; streak : Nat; lastUpdated : Text } {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view progress");
    };
    progress.get(caller);
  };

  public shared ({ caller }) func addJournalEntry(id : Text, date : Text, content : Text) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can add journal entries");
    };
    let entry = {
      id;
      date;
      content;
    };
    let existing = switch (journal.get(caller)) {
      case (null) { [] };
      case (?journalEntries) { journalEntries };
    };
    let entries = existing.concat([entry]);
    journal.add(caller, entries);
  };

  public query ({ caller }) func getJournalEntries() : async [{ id : Text; date : Text; content : Text }] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view journal entries");
    };
    switch (journal.get(caller)) {
      case (null) { [] };
      case (?journalEntries) { journalEntries };
    };
  };

  public shared ({ caller }) func deleteJournalEntry(id : Text) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can delete journal entries");
    };
    let existing = switch (journal.get(caller)) {
      case (null) { [] };
      case (?journalEntries) { journalEntries };
    };
    let filtered = existing.filter(func(entry) { entry.id != id });
    journal.add(caller, filtered);
  };

  public query ({ caller }) func getAllUsersAdmin() : async [{ principal : Text; name : Text; email : Text; tasksCompleted : Nat; streak : Nat; journalCount : Nat }] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can view all users");
    };
    let usersIter = usersNew.entries();
    usersIter.map(
      func((principal, user)) {
        {
          principal = principal.toText();
          name = user.name;
          email = user.email;
          tasksCompleted = switch (progress.get(principal)) {
            case (null) { 0 };
            case (?progressData) { progressData.tasksCompleted };
          };
          streak = switch (progress.get(principal)) {
            case (null) { 0 };
            case (?progressData) { progressData.streak };
          };
          journalCount = switch (journal.get(principal)) {
            case (null) { 0 };
            case (?journalEntries) { journalEntries.size() };
          };
        };
      }
    ).toArray();
  };
};

