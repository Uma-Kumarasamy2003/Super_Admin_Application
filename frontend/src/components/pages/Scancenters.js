import React, { useState, useEffect } from "react";
import { PlusOutlined, EditOutlined, DeleteOutlined } from "@ant-design/icons";
import { Table, message, Button, Modal, Form, Input } from "antd";
import "../styles/admin_doctor_scancentre.css";

const Scancentres = () => {
  const [centres, setCentres] = useState(() => {
    const saved = localStorage.getItem("scanCentres");
    return saved ? JSON.parse(saved) : [];
  });

  const [showModal, setShowModal] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form] = Form.useForm();

  useEffect(() => {
    localStorage.setItem("scanCentres", JSON.stringify(centres));
  }, [centres]);

  const openAddModal = () => {
    setIsEditMode(false);
    form.resetFields();
    setShowModal(true);
  };

  const handleEdit = (record) => {
    setIsEditMode(true);
    setEditingId(record.id);
    form.setFieldsValue(record);
    setShowModal(true);
  };

  const handleDelete = (id) => {
    const updatedCentres = centres.filter((centre) => centre.id !== id);
    setCentres(updatedCentres);
    message.success("Scan Centre deleted successfully!");
  };

  const handleFormSubmit = async () => {
    try {
      const values = await form.validateFields();

      if (isEditMode) {
        const updatedCentres = centres.map((centre) =>
          centre.id === editingId ? { ...values, id: editingId } : centre
        );
        setCentres(updatedCentres);
        message.success("Scan Centre updated successfully!");
      } else {
        const newId = `SC${centres.length + 1}`;
        const newCentre = { ...values, id: newId };
        setCentres([...centres, newCentre]);
        message.success("Scan Centre added successfully!");
      }

      setShowModal(false);
      form.resetFields();
      setEditingId(null);
    } catch (errorInfo) {
      console.log("Validation Failed:", errorInfo);
    }
  };

  const columns = [
    {
      title: "Name",
      dataIndex: "name",
      key: "name",
    },
    {
      title: "Email",
      dataIndex: "email",
      key: "email",
    },
    {
      title: "Phone",
      dataIndex: "phone",
      key: "phone",
    },
    {
      title: "Address",
      dataIndex: "address",
      key: "address",
    },
    {
      title: "Action",
      key: "action",
      render: (_, record) => (
        <span style={{ color: "#085cda", cursor: "pointer", fontSize: "15px" }}>
          <EditOutlined
            onClick={() => handleEdit(record)}
            style={{ marginRight: 10 }}
          />
          <DeleteOutlined onClick={() => handleDelete(record.id)} />
        </span>
      ),
    },
  ];

  return (
    <div className="admin-container">
      <div className="admin-header">
        <h2>Scan Centres</h2>
        <Button type="primary" icon={<PlusOutlined />} onClick={openAddModal}>
          Add Scan Centre
        </Button>
      </div>

      <Table
        columns={columns}
        dataSource={centres}
        rowKey="id"
        pagination={{ pageSize: 5 }}
      />

      <Modal
        title={isEditMode ? "Edit Scan Centre" : "Add Scan Centre"}
        open={showModal}
        onCancel={() => setShowModal(false)}
        footer={null} // <- Remove default Cancel and OK buttons
        className="admin-modal"
        width={700}
      >
        <Form
          form={form}
          layout="vertical"
          requiredMark={false}
          className="admin-form"
          onFinish={handleFormSubmit}
        >
          <Form.Item
            label="Name"
            name="name"
            rules={[{ required: true, message: "Name is required!" }]}
          >
            <Input placeholder="Enter name" />
          </Form.Item>

          <Form.Item
            label="Email"
            name="email"
            rules={[{ required: true, message: "Email is required!" }]}
          >
            <Input type="email" placeholder="Enter email" />
          </Form.Item>

          <Form.Item
            label="Phone"
            name="phone"
            rules={[{ required: true, message: "Phone number is required!" }]}
          >
            <Input placeholder="Enter phone" />
          </Form.Item>

          <Form.Item
            label="Address"
            name="address"
            rules={[{ required: true, message: "Address is required!" }]}
          >
            <Input placeholder="Enter address" />
          </Form.Item>
          <Form.Item>
            <div className="admin-form-button">
              <Button type="primary" htmlType="submit">
                {isEditMode ? "Update" : "Add"}
              </Button>
            </div>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default Scancentres;
