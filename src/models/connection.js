const mongoose = require("mongoose");

const connectionSchema = new mongoose.Schema(
  {
    fromUserId: {
      type: mongoose.Schema.ObjectId,
      ref: "User",
      require: true,
    },
    toUserId: {
      type: mongoose.Schema.ObjectId,
      require: true,
    },
    status: {
      type: String,
      require: true,
      enum: {
        values: ["accepted", "ignored", "intrested", "rejected"],
        message: "status is not valid : `{VALUE}`",
      },
    },
  },
  {
    timestamps: true,
  }
);

connectionSchema.index({ fromUserId: 1, toUserId: 1 });

connectionSchema.pre("save", function (next) {
  const connectionReq = this;
  if (connectionReq.fromUserId.equals(this.toUserId)) {
    throw new Error("Cannot send request to yourself");
  }
  next();
});

module.exports = mongoose.model("Connection", connectionSchema);
