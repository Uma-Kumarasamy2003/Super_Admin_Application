import React, { useState, useEffect } from "react";
import "../styles/admin_doctor_scancentre.css";
import {
  PlusOutlined,
  DeleteOutlined,
  EditOutlined,
} from "@ant-design/icons";
import {
  Table,
  Select,
  message,
  Modal,
  Form,
  Input,
  Button,
} from "antd";

const { Option } = Select;

const Admin = () => {
  const [adminData, setAdminData] = useState([]);
  const [featureOptions, setFeatureOptions] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [newAdmin, setNewAdmin] = useState({
    firstName: "",
    lastName: "",
    name: "",
    email: "",
    phone: "",
    specialization: "",
    address: "",
    features: [],
  });

  const [isEditMode, setIsEditMode] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [form] = Form.useForm();

  // Fetch admin data from backend and include features from localStorage if available
  useEffect(() => {
    setLoading(true);
    fetch("http://localhost:3000/api/v1/admins")
      .then((res) => res.json())
      .then((data) => {
        const formatted = data.map((admin) => {
          const id = `ADM${admin.id}`;
          // Try to get saved features from localStorage
          const savedFeatures = localStorage.getItem(id);
          return {
            ...admin,
            name: `${admin.firstname} ${admin.lastname}`,
            id,
            features: savedFeatures ? JSON.parse(savedFeatures) : [],
          };
        });
        setAdminData(formatted);
        localStorage.setItem("adminData", JSON.stringify(formatted)); // ADD THIS LINE

        setLoading(false);
      })
      .catch((error) => {
        console.error("Error fetching admins:", error);
        message.error("Failed to load admin data");
        setLoading(false);
      });
  }, []);

  // Load feature options from localStorage (you can adjust this logic to fetch real feature options)
  useEffect(() => {
    const storedFeatures = localStorage.getItem("features");
    if (storedFeatures) {
      setFeatureOptions(JSON.parse(storedFeatures));
    }
  }, []);

  const openAddModal = () => {
    setNewAdmin({
      firstName: "",
      lastName: "",
      name: "",
      email: "",
      phone: "",
      specialization: "",
      address: "",
      features: [],
    });
    setIsEditMode(false);
    setShowModal(true);
    form.resetFields();
  };

  const handleAddOrUpdateAdmin = () => {
    const values = form.getFieldsValue();
    const selectedFeatures = values.features || [];

    const adminEntry = {
      firstname: values.firstName,
      lastname: values.lastName,
      email: values.email,
      phone: values.phone,
      specialization: values.specialization,
      address: values.address,
      features: selectedFeatures,
    };

    if (!isEditMode) {
      // ADD admin
      fetch("http://localhost:3000/api/v1/admins", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ admin: adminEntry }),
      })
        .then((res) => res.json())
        .then((newAdmin) => {
          const id = `ADM${newAdmin.id}`;
          const adminWithFeatures = {
            ...newAdmin,
            name: `${newAdmin.firstname} ${newAdmin.lastname}`,
            id,
            features: selectedFeatures,
          };
          setAdminData([...adminData, adminWithFeatures]);
          // Save features to localStorage for this admin
          localStorage.setItem(id, JSON.stringify(selectedFeatures));
          localStorage.setItem("adminData", JSON.stringify([...adminData, adminWithFeatures])); // ADD THIS LINE

          message.success("Admin added successfully!");
        })
        .catch(() => message.error("Failed to add admin"));
    } else {
      const realId = editingId.replace("ADM", "");

      // UPDATE admin
      fetch(`http://localhost:3000/api/v1/admins/${realId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ admin: adminEntry }),
      })
        .then((res) => res.json())
        .then((updatedAdmin) => {
          const id = `ADM${updatedAdmin.id}`;
          const updatedWithFeatures = {
            ...updatedAdmin,
            name: `${updatedAdmin.firstname} ${updatedAdmin.lastname}`,
            id,
            features: selectedFeatures,
          };
          const updatedList = adminData.map((admin) =>
            admin.id === editingId ? updatedWithFeatures : admin
          );
          setAdminData(updatedList);
          // Update features in localStorage
          localStorage.setItem(editingId, JSON.stringify(selectedFeatures));
          localStorage.setItem("adminData", JSON.stringify(updatedList)); // ADD THIS LINE

          message.success("Admin updated successfully!");
        })
        .catch(() => message.error("Failed to update admin"));
    }

    setShowModal(false);
    setEditingId(null);
    form.resetFields();
  };

  const handleEdit = (record) => {
    const [firstName, ...lastParts] = record.name.split(" ");
    const lastName = lastParts.join(" ");

    // Load saved features from localStorage or use from record
    const savedFeatures = localStorage.getItem(record.id);
    const features = savedFeatures ? JSON.parse(savedFeatures) : record.features || [];

    const updatedAdmin = {
      ...record,
      firstName,
      lastName,
      features,
    };

    form.setFieldsValue(updatedAdmin);
    setNewAdmin(updatedAdmin);
    setEditingId(record.id);
    setIsEditMode(true);
    setShowModal(true);
  };

  const handleDelete = (id) => {
    const realId = id.replace("ADM", "");
    fetch(`http://localhost:3000/api/v1/admins/${realId}`, {
      method: "DELETE",
    })
      .then(() => {
        const filtered = adminData.filter((admin) => admin.id !== id);
        setAdminData(filtered);
        // Remove features from localStorage on delete
        localStorage.removeItem(id);
        message.success("Admin deleted successfully!");
      })
      .catch(() => message.error("Failed to delete admin"));
  };

  const columns = [
    { title: "Name", dataIndex: "name", key: "name" },
    { title: "Email", dataIndex: "email", key: "email" },
    { title: "Phone", dataIndex: "phone", key: "phone" },
    {
      title: "Specialization",
      dataIndex: "specialization",
      key: "specialization",
    },
    { title: "ID", dataIndex: "id", key: "id" },
    { title: "Address", dataIndex: "address", key: "address" },
  
    {
      title: "Action",
      key: "action",
      render: (_, record) => (
        <span style={{ color: "#085cda", cursor: "pointer", fontSize: "15px" }}>
          <EditOutlined
            onClick={() => handleEdit(record)}
            style={{ marginRight: "10px" }}
          />
          <DeleteOutlined onClick={() => handleDelete(record.id)} />
        </span>
      ),
    },
  ];

  return (
    <div className="admin-container">
      <div className="admin-header">
        <h2>Admins</h2>
        <Button type="primary" onClick={openAddModal}>
          <PlusOutlined /> Add Admin
        </Button>
      </div>

      <div style={{ overflowX: "auto" }}>
        <Table
          columns={columns}
          dataSource={adminData}
          rowKey="id"
          pagination={{ pageSize: 5 }}
          loading={loading}
        />
      </div>

      <Modal
        title={isEditMode ? "Edit Admin" : "Add Admin"}
        open={showModal}
        onCancel={() => setShowModal(false)}
        footer={null}
        destroyOnClose
        className="admin-modal"
        width={700}
      >
        <Form
          form={form}
          layout="vertical"
          initialValues={newAdmin}
          onFinish={handleAddOrUpdateAdmin}
          requiredMark={false}
          className="admin-form"
        >
          <Form.Item
            label="First Name"
            name="firstName"
            rules={[{ required: true, message: "First name is required!" }]}
          >
            <Input placeholder="Enter First name" />
          </Form.Item>
          <Form.Item
            label="Last Name"
            name="lastName"
            rules={[{ required: true, message: "Last name is required!" }]}
          >
            <Input placeholder="Enter Last name" />
          </Form.Item>
          <Form.Item
            label="Email"
            name="email"
            rules={[{ required: true, type: "email", message: "Email is required!" }]}
          >
            <Input placeholder="Enter Email" />
          </Form.Item>
          <Form.Item
            label="Phone"
            name="phone"
            rules={[{ required: true, message: "Phone number is required!" }]}
          >
            <Input placeholder="Enter Phone" />
          </Form.Item>
          <Form.Item
            label="Specialization"
            name="specialization"
            rules={[{ required: true, message: "Specialization is required!" }]}
          >
            <Input placeholder="Enter Specialization" />
          </Form.Item>
          <Form.Item
            label="Address"
            name="address"
            rules={[{ required: true, message: "Address is required!" }]}
          >
            <Input placeholder="Enter Address" />
          </Form.Item>
          <Form.Item label="Features" name="features" className="features-field">
            <Select
              mode="multiple"
              allowClear
              placeholder="Select Features"
              onChange={(value) => setNewAdmin({ ...newAdmin, features: value })}
            >
              {featureOptions.map((feature) => (
                <Option key={feature.name} value={feature.name}>
                  {feature.name}
                </Option>
              ))}
            </Select>
          </Form.Item>
          <Form.Item>
            <div className="admin-form-button">
              <Button type="primary" htmlType="submit" className="admin-form-button">
                {isEditMode ? "Update" : "Add"}
              </Button>
            </div>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default Admin;
