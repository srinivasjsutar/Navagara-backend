const Member = require("../models/Member");
const cloudinary = require("../cloudinaryConfig");

// Helper function to safely parse numbers
const safeParseInt = (value, fieldName) => {
  if (value === "" || value === null || value === undefined) {
    throw new Error(`${fieldName} is required`);
  }
  const parsed = parseInt(value);
  if (isNaN(parsed)) {
    throw new Error(`${fieldName} must be a valid number`);
  }
  return parsed;
};

// Add new member
exports.addMember = async (req, res) => {
  try {
    let imageUrl = null;
    if (req.file) {
      const result = await new Promise((resolve, reject) => {
        const stream = cloudinary.uploader.upload_stream(
          { folder: "members" },
          (error, result) => {
            if (error) reject(error);
            else resolve(result);
          },
        );
        stream.end(req.file.buffer);
      });
      imageUrl = result.secure_url;
    }
    // Validate and parse all number fields
    const memberData = {
      seniority_no: req.body.seniority_no,
      name: req.body.name,
      membershiptype: req.body.membershiptype,
      date: new Date(req.body.date),
      membershipday: req.body.membershipday,
      dob: new Date(req.body.dob),
      father: req.body.father,
      birthplace: req.body.birthplace,
      email: req.body.email,
      alternateemail: req.body.alternateemail,
      permanentaddress: req.body.permanentaddress,
      correspondenceaddress: req.body.correspondenceaddress,
      nomineename: req.body.nomineename,
      nomineeage: req.body.nomineeage,
      nomineerelationship: req.body.nomineerelationship,
      nomineeaddress: req.body.nomineeaddress,
      agreetermsconditions: req.body.agreetermsconditions === "true",
      agreecommunication: req.body.agreecommunication === "true",
      image: imageUrl,
    };

    // Safely parse number fields
    memberData.aadharnumber = safeParseInt(
      req.body.aadharnumber,
      "Aadhar number",
    );
    memberData.applicationno = safeParseInt(
      req.body.applicationno,
      "Application number",
    );
    memberData.membershipfees = safeParseInt(
      req.body.membershipfees,
      "Membership fees",
    );
    memberData.mobile = safeParseInt(req.body.mobile, "Mobile number");

    // Optional number fields - only parse if provided
    if (req.body.alternatemobile && req.body.alternatemobile !== "") {
      memberData.alternatemobile = safeParseInt(
        req.body.alternatemobile,
        "Alternate mobile",
      );
    }

    if (req.body.nomineenumber && req.body.nomineenumber !== "") {
      memberData.nomineenumber = safeParseInt(
        req.body.nomineenumber,
        "Nominee number",
      );
    }

    const member = new Member(memberData);
    await member.save();

    res.status(201).json({
      success: true,
      message: "Member Added Successfully!",
      data: member,
    });
  } catch (error) {
    console.error("Error adding member:", error);

    // Send detailed error message
    if (
      error.message.includes("is required") ||
      error.message.includes("must be a valid number")
    ) {
      return res.status(400).json({
        success: false,
        message: error.message,
      });
    }

    res.status(500).json({
      success: false,
      message: "Error adding member",
      error: error.message,
    });
  }
};

// Get all members
exports.getAllMembers = async (req, res) => {
  try {
    const members = await Member.find({}).sort({ createdAt: -1 });
    res.status(200).json({
      success: true,
      data: members,
    });
  } catch (error) {
    console.error("Error fetching members:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching members",
      error: error.message,
    });
  }
};

// Update member
exports.updateMember = async (req, res) => {
  try {
    // Validate and parse all number fields
    const memberData = {
      seniority_no: req.body.seniority_no,
      name: req.body.name,
      membershiptype: req.body.membershiptype,
      date: new Date(req.body.date),
      membershipday: req.body.membershipday,
      dob: new Date(req.body.dob),
      father: req.body.father,
      birthplace: req.body.birthplace,
      email: req.body.email,
      alternateemail: req.body.alternateemail,
      permanentaddress: req.body.permanentaddress,
      correspondenceaddress: req.body.correspondenceaddress,
      nomineename: req.body.nomineename,
      nomineeage: req.body.nomineeage,
      nomineerelationship: req.body.nomineerelationship,
      nomineeaddress: req.body.nomineeaddress,
      agreetermsconditions: req.body.agreetermsconditions === "true",
      agreecommunication: req.body.agreecommunication === "true",
    };

    // Safely parse number fields
    memberData.aadharnumber = safeParseInt(
      req.body.aadharnumber,
      "Aadhar number",
    );
    memberData.applicationno = safeParseInt(
      req.body.applicationno,
      "Application number",
    );
    memberData.membershipfees = safeParseInt(
      req.body.membershipfees,
      "Membership fees",
    );
    memberData.mobile = safeParseInt(req.body.mobile, "Mobile number");

    // Optional number fields
    if (req.body.alternatemobile && req.body.alternatemobile !== "") {
      memberData.alternatemobile = safeParseInt(
        req.body.alternatemobile,
        "Alternate mobile",
      );
    }

    if (req.body.nomineenumber && req.body.nomineenumber !== "") {
      memberData.nomineenumber = safeParseInt(
        req.body.nomineenumber,
        "Nominee number",
      );
    }

    const updatedMember = await Member.updateOne(
      { seniority_no: req.params.id },
      { $set: memberData },
    );

    if (updatedMember.matchedCount === 0) {
      return res.status(404).json({
        success: false,
        message: "Member not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Successfully Updated!",
    });
  } catch (error) {
    console.error("Error updating member:", error);

    if (
      error.message.includes("is required") ||
      error.message.includes("must be a valid number")
    ) {
      return res.status(400).json({
        success: false,
        message: error.message,
      });
    }

    res.status(500).json({
      success: false,
      message: "Error updating member",
      error: error.message,
    });
  }
};
