const mongoose = require("..//mongoose.service").mongoose;

const Schema = mongoose.Schema;

const deviceSchema = new Schema({
  // clientId:String,
  deviceNo: Number,
  deviceIMEI: String,
  deviceMake: String,
  deviceModel: String,
  // deviceFittedDate: Date,
  // deviceConfiguredBy: String,
  mobNo: String,
  simNo: String,
  simProvider: String,
  UserName: String,
  password: String,
  // vehicleNo:String,
  MachineStatus: String,
  IsActive: Boolean,
  dualCam: Boolean,
});

deviceSchema.virtual("id").get(function () {
  return this._id.toHexString();
});

// Ensure virtual fields are serialised.
deviceSchema.set("toJSON", {
  virtuals: true,
});

deviceSchema.findById = function (cb) {
  return this.model("Devices").find({ id: this.id }, cb);
};

const Device = mongoose.model("Devices", deviceSchema);

exports.model = mongoose.model("Devices", deviceSchema);

exports.findById = (id) => {
  return Device.find({ _id: id }).then((result) => {
    return result;
  });
};

exports.CreateDevice = (deviceData) => {
  const device = new Device(deviceData);
  return device.save();
};
exports.list = (perPage, page) => {
  return new Promise((resolve, reject) => {
    Device.find()
      .limit(perPage)
      .skip(perPage * page)
      .exec(function (err, users) {
        if (err) {
          reject(err);
        } else {
          resolve(users);
        }
      });
  });
};

exports.listUnAllocated = () => {
  return new Promise((resolve, reject) => {
    Device.find({ MachineStatus: "UnAllocated" }).exec(function (err, users) {
      if (err) {
        reject(err);
      } else {
        resolve(users);
      }
    });
  });
};

exports.patchDevice = (id, DeviceData) => {
  return Device.findOneAndUpdate(
    {
      _id: id,
    },
    DeviceData
  );
};

exports.UpdateDeviceStatus = (id) => {
  return Device.findOneAndUpdate(
    {
      _id: id,
    },
    { MachineStatus: "Allocated" }
  );
};

exports.UpdateDeviceStatusFree = (id) => {
  return Device.findOneAndUpdate(
    {
      _id: id,
    },
    { MachineStatus: "UnAllocated" }
  );
};

exports.removeById = (id) => {
  return new Promise((resolve, reject) => {
    Device.deleteMany({ _id: id }, (err) => {
      if (err) {
        reject(err);
      } else {
        resolve(err);
      }
    });
  });
};

exports.getTotalDevices = (id) => {
  return Device.countDocuments();
};

exports.ActiveDeviceList = (perPage, page) => {
  return new Promise((resolve, reject) => {
    Device.find({ IsActive: true })
      .limit(perPage)
      .skip(perPage * page)
      .exec(function (err, users) {
        if (err) {
          reject(err);
        } else {
          resolve(users);
        }
      });
  });
};

exports.ActiveDevices = async () => {
  return await Device.find({ IsActive: true });
};

exports.getActiveDevices = (perPage, page) => {
  return new Promise((resolve, reject) => {
    Device.find({ IsActive: true })
      .countDocuments()
      // Device.countDocuments({IsActive:true})
      .limit(perPage)
      // .skip(perPage * page)
      .exec(function (err, users) {
        if (err) {
          reject(err);
        } else {
          resolve(users);
        }
      });
  });
};

exports.getConnectedDevices = (perPage, page) => {
  return new Promise((resolve, reject) => {
    Device.find({ MachineStatus: "Connected" })
      .countDocuments()
      .limit(perPage)
      // .skip(perPage * page)
      .exec(function (err, users) {
        if (err) {
          reject(err);
        } else {
          resolve(users);
        }
      });
  });
};

exports.getAllocatedDevices = (perPage, page) => {
  return new Promise((resolve, reject) => {
    Device.find({ MachineStatus: "Allocated" })
      .countDocuments()
      .limit(perPage)
      // .skip(perPage * page)
      .exec(function (err, users) {
        if (err) {
          reject(err);
        } else {
          resolve(users);
        }
      });
  });
};

exports.getUnAllocatedDevices = (perPage, page) => {
  return new Promise((resolve, reject) => {
    Device.find({ MachineStatus: "UnAllocated" })
      .countDocuments()
      .limit(perPage)
      // .skip(perPage * page)
      .exec(function (err, users) {
        if (err) {
          reject(err);
        } else {
          resolve(users);
        }
      });
  });
};

exports.AllocatedDeviceList = (perPage, page) => {
  return new Promise((resolve, reject) => {
    Device.find({ IsActive: true } && { MachineStatus: "Allocated" })
      .limit(perPage)
      .skip(perPage * page)
      .exec(function (err, users) {
        if (err) {
          reject(err);
        } else {
          resolve(users);
        }
      });
  });
};

exports.ConnectedDeviceList = (perPage, page) => {
  return new Promise((resolve, reject) => {
    Device.find({ IsActive: true } && { MachineStatus: "Connected" })
      .limit(perPage)
      .skip(perPage * page)
      .exec(function (err, users) {
        if (err) {
          reject(err);
        } else {
          resolve(users);
        }
      });
  });
};

exports.DeviceByName = async (fieldType, fieldValue) => {
  var mainObj = {};
  var childObj = {};
  childObj["$regex"] = fieldValue;
  mainObj[fieldType] = childObj;

  return await Device.find(mainObj);
};

exports.GetDevicesIMEI = async (deviceIMEI) => {
  return await Device.find({ deviceIMEI: deviceIMEI });
};

exports.getMaxno = async () => {
  return await Device.find().sort({ deviceNo: -1 }).limit(1);
};

exports.CountDevicesIMEI = async (deviceIMEI) => {
  return await Device.countDocuments({ deviceIMEI: deviceIMEI });
};
