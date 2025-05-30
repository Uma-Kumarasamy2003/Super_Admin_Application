import React, { useEffect, useState } from "react";
import { Select, Table, Button, Form, Modal, message } from "antd";
import "../styles/admin_doctor_features.css";

const { Option } = Select;

const DoctorFeatures = () => {
  const [adminData, setAdminData] = useState([]);
  const [doctorData, setDoctorData] = useState([]);
  const [selectedAdminId, setSelectedAdminId] = useState(null);
  const [selectedDoctorId, setSelectedDoctorId] = useState(null);
  const [features, setFeatures] = useState([]);
  const [metadata, setMetadata] = useState({ features: [] });

  const [isModalVisible, setIsModalVisible] = useState(false);
  const [selectedFeature, setSelectedFeature] = useState(null);

  useEffect(() => {
    const storedFeatures = JSON.parse(localStorage.getItem("features") || "[]");
    setMetadata((prev) => ({features: storedFeatures }));
  }, []);

  useEffect(() => {
    const storedAdmins = localStorage.getItem("adminData");
    const storedDoctors = localStorage.getItem("doctorData");

    if (storedAdmins) setAdminData(JSON.parse(storedAdmins));
    if (storedDoctors) setDoctorData(JSON.parse(storedDoctors));
  }, []);

  const handleAdminChange = (adminId) => {
    setSelectedAdminId(adminId);
    setSelectedDoctorId(null);
    setFeatures([]);
  };

  const handleDoctorChange = (doctorId) => {
    setSelectedDoctorId(doctorId);
    const selectedDoctor = doctorData.find((d) => d.id === doctorId);
    const selectedFeatures = selectedDoctor
      ? selectedDoctor.features || []
      : [];

    const mappedFeatures = selectedFeatures.map((featureName) => {
      const feature = metadata.features.find((f) => f.name === featureName);
      return {
        featureId: feature ? feature.id : "N/A",
        featureName,
      };
    });

    setFeatures(mappedFeatures);
  };

  const getSelectedAdminName = () => {
    const admin = adminData.find((admin) => admin.id === selectedAdminId);
    return admin ? admin.name : null;
  };

  const showModal = () => {
    setSelectedFeature(null);
    setIsModalVisible(true);
  };

  const getUnassignedFeatures = () => {
    const assignedFeatureNames = features.map((f) => f.featureName);
    return metadata.features.filter(
      (feature) => !assignedFeatureNames.includes(feature.name)
    );
  };

  const handleAddFeature = () => {
    if (!selectedFeature) {
      message.warning("Please select a feature.");
      return;
    }

    const featureObj = metadata.features.find((f) => f.id === selectedFeature);
    if (!featureObj) {
      message.error("Selected feature not found.");
      return;
    }

    const updatedDoctors = doctorData.map((doctor) => {
      if (doctor.id === selectedDoctorId) {
        const updatedFeatures = [...(doctor.features || []), featureObj.name];
        // Save features for this admin using their ID as key
        localStorage.setItem(doctor.id, JSON.stringify(updatedFeatures));
        return { ...doctor, features: updatedFeatures };
      }
      return doctor;
    });

    setDoctorData(updatedDoctors);
    localStorage.setItem("doctorData", JSON.stringify(updatedDoctors));

    setFeatures((prev) => [
      ...prev,
      { featureId: featureObj.id, featureName: featureObj.name },
    ]);
    setIsModalVisible(false);
    message.success("Feature added successfully.");
  };

  const columns = [
    { title: "Feature ID", dataIndex: "featureId", key: "featureId" },
    { title: "Feature Name", dataIndex: "featureName", key: "featureName" },
  ];

  return (
    <div className="admin-container">
      <div className="admin-header">
        <h2>Doctor Features</h2>
      </div>

      <div className="admin-dropdown-row">
        <div className="dropdown-group">
          <label>Admin Name:</label>
          <Select
            placeholder="Select Admin"
            style={{ width: 200 }}
            value={selectedAdminId}
            onChange={handleAdminChange}
          >
            {adminData.map((admin) => (
              <Option key={admin.id} value={admin.id}>
                {admin.name}
              </Option>
            ))}
          </Select>
        </div>

        <div className="dropdown-group">
          <label>Doctor Name:</label>
          <Select
            placeholder="Select Doctor"
            style={{ width: 200 }}
            value={selectedDoctorId}
            onChange={handleDoctorChange}
            disabled={!selectedAdminId}
          >
            {doctorData
              .filter((doctor) => doctor.adminName === getSelectedAdminName())
              .map((doctor) => (
                <Option key={doctor.id} value={doctor.id}>
                  {doctor.name}
                </Option>
              ))}
          </Select>
        </div>
      </div>

      <div className="admin-features-table">
        <Table
          columns={columns}
          dataSource={features}
          rowKey="featureId"
          pagination={false}
        />
      </div>

      <div style={{ marginTop: 20 }}>
        <Button type="primary" onClick={showModal} disabled={!selectedDoctorId}>
          Add Feature
        </Button>
      </div>

      <Modal
        title="Add Feature"
        open={isModalVisible}
        onCancel={() => setIsModalVisible(false)}
        footer={null}
        className="admin-feature-modal"
      >
        <Form
          layout="vertical"
          className="admin-form"
          onFinish={handleAddFeature}
        >
          <Form.Item label="Select Feature">
            <Select
              placeholder="Select feature"
              value={selectedFeature}
              onChange={(value) => setSelectedFeature(value)}
            >
              {getUnassignedFeatures().map((feature) => (
                <Option key={feature.id} value={feature.id}>
                  {feature.id} - {feature.name}
                </Option>
              ))}
            </Select>
          </Form.Item>
          <Form.Item>
            <div className="admin-form-button">
              <Button type="primary" htmlType="submit">
                Add
              </Button>
            </div>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default DoctorFeatures;
