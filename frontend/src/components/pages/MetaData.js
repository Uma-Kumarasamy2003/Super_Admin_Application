import React, { useState, useEffect } from "react";
import "../styles/metadata.css";
import { PlusOutlined, EditOutlined, DeleteOutlined } from "@ant-design/icons";
import { Table, Button, message, Modal, Form, Input } from "antd";

const MetaData = () => {
  const [openSection, setOpenSection] = useState(null);

  const getFromLocalStorage = (key, defaultValue) => {
    const data = localStorage.getItem(key);
    return data ? JSON.parse(data) : defaultValue;
  };

  const [features, setFeatures] = useState(() =>
    getFromLocalStorage("features", [
      { name: "AI Facility", id: "F001" },
      { name: "WhatsApp Sharing", id: "F002" },
      { name: "Voice to Text", id: "F003" },
    ])
  );
  const [bodyParts, setBodyParts] = useState(() =>
    getFromLocalStorage("bodyParts", [
      { name: "Chest", id: "B001" },
      { name: "Brain", id: "B002" },
      { name: "Hand", id: "B003" },
    ])
  );
  const [scanTypes, setScanTypes] = useState(() =>
    getFromLocalStorage("scanTypes", [
      { name: "CT", id: "S001" },
      { name: "X-ray", id: "S002" },
      { name: "MRI", id: "S003" },
    ])
  );

  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState("");
  const [isEditing, setIsEditing] = useState(false);
  const [editIndex, setEditIndex] = useState(null);

  const [form] = Form.useForm();

  useEffect(() => {
    localStorage.setItem("features", JSON.stringify(features));
    localStorage.setItem("bodyParts", JSON.stringify(bodyParts));
    localStorage.setItem("scanTypes", JSON.stringify(scanTypes));
  }, [features, bodyParts, scanTypes]);

  const toggleSection = (section) => {
    setOpenSection(openSection === section ? null : section);
  };

  const openAddModal = (type) => {
    setModalType(type);
    form.resetFields();
    setIsEditing(false);
    setEditIndex(null);
    setShowModal(true);
  };

  const openEditModal = (item, index, type) => {
    setModalType(type);
    form.setFieldsValue(item);
    setIsEditing(true);
    setEditIndex(index);
    setShowModal(true);
  };

  const handleFormSubmit = async () => {
    try {
      const values = await form.validateFields();

      const updated =
        modalType === "features"
          ? [...features]
          : modalType === "bodyParts"
          ? [...bodyParts]
          : [...scanTypes];

      if (isEditing) {
        updated[editIndex] = values;
        message.success("Updated successfully!");
      } else {
        updated.push(values);
        message.success("Added successfully!");
      }

      if (modalType === "features") setFeatures(updated);
      else if (modalType === "bodyParts") setBodyParts(updated);
      else if (modalType === "scanTypes") setScanTypes(updated);

      setShowModal(false);
    } catch (err) {
      console.log("Validation Failed:", err);
    }
  };

  const handleDeleteItem = (index, type) => {
    if (type === "features") {
      setFeatures(features.filter((_, i) => i !== index));
    } else if (type === "bodyParts") {
      setBodyParts(bodyParts.filter((_, i) => i !== index));
    } else if (type === "scanTypes") {
      setScanTypes(scanTypes.filter((_, i) => i !== index));
    }
    message.success("Deleted successfully!");
  };

  const renderAction = (item, index, type) => (
    <span>
      <EditOutlined
        style={{ color: "#085cda", marginRight: 10, fontSize: "15px" }}
        onClick={() => openEditModal(item, index, type)}
      />
      <DeleteOutlined
        style={{ color: "#085cda", fontSize: "15px" }}
        onClick={() => handleDeleteItem(index, type)}
      />
    </span>
  );

  const getColumns = (type) => [
    { title: "Name", dataIndex: "name", key: "name" },
    { title: "ID", dataIndex: "id", key: "id" },
    {
      title: "Action",
      key: "action",
      render: (_, item, index) => renderAction(item, index, type),
    },
  ];

  const renderTable = (data, type) => (
    <>
      <Table
        columns={getColumns(type)}
        dataSource={data.map((item, index) => ({ ...item, key: index }))}
        pagination={{ pageSize: 3 }}
        bordered
      />
      <Button
        type="primary"
        icon={<PlusOutlined />}
        className="add-button"
        onClick={() => openAddModal(type)}
      >
        Add
      </Button>
    </>
  );

  return (
    <div className="meta-container">
      <h2 className="meta-title">Meta Data</h2>

      <div className="accordion">
        {["features", "bodyParts", "scanTypes", "tags"].map((section) => (
          <div key={section}>
            <div
              className="accordion-header"
              onClick={() => toggleSection(section)}
            >
              {section.charAt(0).toUpperCase() +
                section.slice(1).replace(/([A-Z])/g, " $1")}
              <span
                className={`dropdown-icon ${
                  openSection === section ? "rotate" : ""
                }`}
              >
                ▾
              </span>
            </div>
            {openSection === section && (
              <div className="accordion-content">
                {section === "features" && renderTable(features, section)}
                {section === "bodyParts" && renderTable(bodyParts, section)}
                {section === "scanTypes" && renderTable(scanTypes, section)}
                {section === "tags" && <p>No data available.</p>}
              </div>
            )}
          </div>
        ))}
      </div>

      <Modal
        title={`${isEditing ? "Edit" : "Add"} ${modalType
          .charAt(0)
          .toUpperCase()}${modalType.slice(1)}`}
        open={showModal}
        onCancel={() => setShowModal(false)}
        footer={null}
        className="admin-modal"
        width={700} 
      >
        <Form
          form={form}
          layout="vertical"
          requiredMark={false}
          onFinish={handleFormSubmit}
          className="admin-form"
        >
          <Form.Item
            label="Name"
            name="name"
            rules={[{ required: true, message: "Please enter the name" }]}
          >
            <Input placeholder="Enter Name" />
          </Form.Item>
          <Form.Item
            label="ID"
            name="id"
            rules={[{ required: true, message: "Please enter the ID" }]}
          >
            <Input placeholder="Enter ID" />
          </Form.Item>
          <Form.Item>
            <div className="admin-form-button">
              <Button type="primary" htmlType="submit">
                {isEditing ? "Update" : "Add"}
              </Button>
            </div>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default MetaData;
