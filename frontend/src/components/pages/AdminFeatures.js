import React, { useEffect, useState } from "react";
import { Select, Table, Button, Form, Modal, message } from "antd";
import "../styles/admin_doctor_features.css";

const { Option } = Select;

const AdminFeatures = () => {
  const [adminData, setAdminData] = useState([]);
  const [selectedId, setSelectedId] = useState(null);
  const [selectedName, setSelectedName] = useState(null);
  const [features, setFeatures] = useState([]);
  const [metadata, setMetadata] = useState({ features: [] });

  const [isModalVisible, setIsModalVisible] = useState(false);
  const [selectedFeature, setSelectedFeature] = useState(null);

  // Load metadata from localStorage
  useEffect(() => {
    const storedFeatures = JSON.parse(localStorage.getItem("features") || "[]");
    setMetadata({ features: storedFeatures });
  }, []);

  // Load admin data from localStorage
  useEffect(() => {
    const storedData = localStorage.getItem("adminData");
    if (storedData) {
      const parsed = JSON.parse(storedData);
      const syncedAdmins = parsed.map((admin) => {
        const savedFeatures = localStorage.getItem(admin.id);
        return {
          ...admin,
          features: savedFeatures ? JSON.parse(savedFeatures) : admin.features || [],
        };
      });
      setAdminData(syncedAdmins);
    }
  }, []);

  // Handle admin selection
  const handleIdChange = (value) => {
    setSelectedId(value);
    const selectedAdmin = adminData.find((admin) => admin.id === value);
    setSelectedName(selectedAdmin ? selectedAdmin.name : null);

    const selectedFeatures = selectedAdmin ? selectedAdmin.features || [] : [];
    const mappedFeatures = selectedFeatures.map((featureName) => {
      const feature = metadata.features.find((f) => f.name === featureName);
      return {
        featureId: feature ? feature.id : "N/A",
        featureName,
      };
    });
    setFeatures(mappedFeatures);
  };

  // Open modal
  const showModal = () => {
    setSelectedFeature(null);
    setIsModalVisible(true);
  };

  // Add feature to admin
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

    const updatedAdmins = adminData.map((admin) => {
      if (admin.id === selectedId) {
        const updatedFeatures = [...(admin.features || []), featureObj.name];
        // Save features for this admin using their ID as key
        localStorage.setItem(admin.id, JSON.stringify(updatedFeatures));
        return { ...admin, features: updatedFeatures };
      }
      return admin;
    });

    setAdminData(updatedAdmins);
    localStorage.setItem("adminData", JSON.stringify(updatedAdmins));

    setFeatures((prev) => [
      ...prev,
      { featureId: featureObj.id, featureName: featureObj.name },
    ]);

    setIsModalVisible(false);
    message.success("Feature added successfully.");
  };

  const columns = [
    {
      title: "Feature ID",
      dataIndex: "featureId",
      key: "featureId",
    },
    {
      title: "Feature Name",
      dataIndex: "featureName",
      key: "featureName",
    },
  ];

  // Filter features to exclude already added ones
  const getUnassignedFeatures = () => {
    const assignedFeatureNames = features.map((f) => f.featureName);
    return metadata.features.filter(
      (feature) => !assignedFeatureNames.includes(feature.name)
    );
  };

  return (
    <div className="admin-container">
      <div className="admin-header">
        <h2>Admin Features</h2>
      </div>

      <div className="admin-dropdown-row">
        <div className="dropdown-group">
          <label>Admin ID:</label>
          <Select
            placeholder="Select Admin ID"
            style={{ width: 200 }}
            value={selectedId}
            onChange={handleIdChange}
          >
            {adminData.map((admin) => (
              <Option key={admin.id} value={admin.id}>
                {admin.id}
              </Option>
            ))}
          </Select>
        </div>

        <div className="dropdown-group">
          <label>Admin Name:</label>
          <Select
            placeholder="Admin Name"
            style={{ width: 200 }}
            value={selectedName}
            disabled
          >
            {selectedName && (
              <Option value={selectedName}>{selectedName}</Option>
            )}
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
        <Button type="primary" onClick={showModal} disabled={!selectedId}>
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
        <Form layout="vertical" className="admin-form" onFinish={handleAddFeature}>
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

export default AdminFeatures;
