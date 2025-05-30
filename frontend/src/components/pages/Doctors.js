import React, { useState, useEffect } from "react";
import "../styles/admin_doctor_scancentre.css";
import { PlusOutlined, DeleteOutlined, EditOutlined } from "@ant-design/icons";
import { Table, Select, message, Modal, Form, Input, Button } from "antd";

const { Option } = Select;

const Doctors = () => {
  const [doctorData, setDoctorData] = useState([]);
  const [featureOptions, setFeatureOptions] = useState([]);
  const [adminOptions, setAdminOptions] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [loading, setLoading] = useState(false);

  const [form] = Form.useForm();

  useEffect(() => {
    setLoading(true);
    fetch("http://localhost:3000/api/v1/doctors")
      .then((res) => {
        if (!res.ok) throw new Error("Failed to fetch doctors");
        return res.json();
      })
      .then((data) => {
        const formatted = data.map((doctor) => {
          const id = `DOC${doctor.id}`;
          const savedFeatures = localStorage.getItem(id);
          const savedAdminName = localStorage.getItem(`${id}_adminName`);
          return {
            ...doctor,
            name: `${doctor.firstname} ${doctor.lastname}`,
            id,
            features: savedFeatures ? JSON.parse(savedFeatures) : [],
            adminName: doctor.adminName || savedAdminName || "",
          };
        });
        setDoctorData(formatted);
        setLoading(false);
      })
      .catch((error) => {
        console.error("Error fetching doctors:", error);
        message.error("Failed to load doctors");
        setLoading(false);
      });
  }, []);

  useEffect(() => {
    const storedFeatures = localStorage.getItem("features");
    if (storedFeatures) {
      setFeatureOptions(JSON.parse(storedFeatures));
    }

    const storedAdmins = localStorage.getItem("adminData");
    if (storedAdmins) {
      const admins = JSON.parse(storedAdmins);
      const adminNames = admins.map((admin) => admin.name);
      setAdminOptions(adminNames);
    }
  }, []);

  const openAddModal = () => {
    setIsEditMode(false);
    setEditingId(null);
    form.resetFields();
    setShowModal(true);
  };

  const handleAddOrUpdateDoctor = () => {
    form
      .validateFields()
      .then((values) => {
        const selectedFeatures = values.features || [];

        const doctorEntry = {
          firstname: values.firstName,
          lastname: values.lastName,
          email: values.email,
          phone: values.phone,
          specialization: values.specialization,
          address: values.address,
          adminName: values.adminName || "",
        };

        const features = selectedFeatures;

        if (!isEditMode) {
          // ADD Doctor
          fetch("http://localhost:3000/api/v1/doctors", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ doctor: doctorEntry }),
          })
            .then((res) => {
              if (!res.ok) throw new Error("Failed to add doctor");
              return res.json();
            })
            .then((newDoctor) => {
              const newDoctorId = `DOC${newDoctor.id}`;
              const doctorWithFeatures = {
                ...newDoctor,
                name: `${newDoctor.firstname} ${newDoctor.lastname}`,
                id: newDoctorId,
                features,
                adminName: values.adminName || "",
              };
              setDoctorData([...doctorData, doctorWithFeatures]);
              localStorage.setItem(newDoctorId, JSON.stringify(features));
              localStorage.setItem(`${newDoctorId}_adminName`, values.adminName || "");
              message.success("Doctor added successfully!");
            })
            .catch(() => {
              message.error("Failed to add doctor");
            });
        } else {
          // UPDATE Doctor
          const realId = editingId.replace("DOC", "");
          fetch(`http://localhost:3000/api/v1/doctors/${realId}`, {
            method: "PUT",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ doctor: doctorEntry }),
          })
            .then((res) => {
              if (!res.ok) throw new Error("Failed to update doctor");
              return res.json();
            })
            .then((updatedDoctor) => {
              const updatedId = `DOC${updatedDoctor.id}`;
              const updatedWithFeatures = {
                ...updatedDoctor,
                name: `${updatedDoctor.firstname} ${updatedDoctor.lastname}`,
                id: updatedId,
                features,
                adminName: values.adminName || "",
              };
              const updatedList = doctorData.map((doctor) =>
                doctor.id === editingId ? updatedWithFeatures : doctor
              );
              setDoctorData(updatedList);
              localStorage.setItem(updatedId, JSON.stringify(features));
              localStorage.setItem(`${updatedId}_adminName`, values.adminName || "");
              message.success("Doctor updated successfully!");
            })
            .catch(() => {
              message.error("Failed to update doctor");
            });
        }

        setShowModal(false);
        setEditingId(null);
        form.resetFields();
      })
      .catch((info) => {
        console.log("Validation Failed:", info);
      });
  };

  const handleEdit = (record) => {
    const [firstName, ...lastParts] = record.name.split(" ");
    const lastName = lastParts.join(" ");
    const savedFeatures = localStorage.getItem(record.id);
    const features = savedFeatures ? JSON.parse(savedFeatures) : record.features || [];

    form.setFieldsValue({
      firstName,
      lastName,
      email: record.email,
      phone: record.phone,
      specialization: record.specialization,
      address: record.address,
      features,
      adminName: record.adminName,
    });

    setEditingId(record.id);
    setIsEditMode(true);
    setShowModal(true);
  };

  const handleDelete = (id) => {
    const realId = id.replace("DOC", "");
    fetch(`http://localhost:3000/api/v1/doctors/${realId}`, {
      method: "DELETE",
    })
      .then(() => {
        const filtered = doctorData.filter((doctor) => doctor.id !== id);
        setDoctorData(filtered);
        localStorage.removeItem(id);
        localStorage.removeItem(`${id}_adminName`);
        message.success("Doctor deleted successfully!");
      })
      .catch(() => message.error("Failed to delete doctor"));
  };

  const columns = [
    { title: "Name", dataIndex: "name", key: "name" },
    { title: "Email", dataIndex: "email", key: "email" },
    { title: "Phone", dataIndex: "phone", key: "phone" },
    { title: "Specialization", dataIndex: "specialization", key: "specialization" },
    { title: "ID", dataIndex: "id", key: "id" },
    { title: "Address", dataIndex: "address", key: "address" },
    { title: "Admin Name", dataIndex: "adminName", key: "adminName" },
    {
      title: "Action",
      key: "action",
      render: (_, record) => (
        <span
          style={{ color: "#085cda", cursor: "pointer", fontSize: "15px" }}
          onClick={(e) => e.stopPropagation()}
        >
          <EditOutlined onClick={() => handleEdit(record)} style={{ marginRight: "10px" }} />
          <DeleteOutlined onClick={() => handleDelete(record.id)} />
        </span>
      ),
    },
  ];

  return (
    <div className="admin-container">
      <div className="admin-header">
        <h2>Doctors</h2>
        <Button type="primary" onClick={openAddModal}>
          <PlusOutlined /> Add Doctor
        </Button>
      </div>

      <Table
        columns={columns}
        dataSource={doctorData}
        rowKey="id"
        pagination={{ pageSize: 5 }}
        loading={loading}
      />

      <Modal
        title={isEditMode ? "Edit Doctor" : "Add Doctor"}
        open={showModal}
        onCancel={() => {
          setShowModal(false);
          form.resetFields();
        }}
        footer={null}
        className="admin-modal"
        width={700}
        destroyOnClose
      >
        <Form
          layout="vertical"
          form={form}
          requiredMark={false}
          className="admin-form"
          onFinish={handleAddOrUpdateDoctor}
        >
          <Form.Item
            name="firstName"
            label="First Name"
            rules={[{ required: true, message: "First name is required!" }]}
          >
            <Input placeholder="Enter First name" />
          </Form.Item>
          <Form.Item
            name="lastName"
            label="Last Name"
            rules={[{ required: true, message: "Last name is required!" }]}
          >
            <Input placeholder="Enter Last name" />
          </Form.Item>
          <Form.Item
            name="email"
            label="Email"
            rules={[{ required: true, message: "Email is required!" }]}
          >
            <Input type="email" placeholder="Enter Email" />
          </Form.Item>
          <Form.Item
            name="phone"
            label="Phone"
            rules={[{ required: true, message: "Phone number is required!" }]}
          >
            <Input placeholder="Enter Phone" />
          </Form.Item>
          <Form.Item
            name="specialization"
            label="Specialization"
            rules={[{ required: true, message: "Specialization is required!" }]}
          >
            <Input placeholder="Enter Specialization" />
          </Form.Item>
          <Form.Item
            name="address"
            label="Address"
            rules={[{ required: true, message: "Address is required!" }]}
          >
            <Input placeholder="Enter Address" />
          </Form.Item>
          <Form.Item name="features" label="Features" className="features-field">
            <Select mode="multiple" allowClear placeholder="Select Features">
              {featureOptions.map((feature) => (
                <Option key={feature.name} value={feature.name}>
                  {feature.name}
                </Option>
              ))}
            </Select>
          </Form.Item>
          <Form.Item
            name="adminName"
            label="Admin Name"
            className="features-field"
            rules={[{ required: true, message: "Admin name is required!" }]}
          >
            <Select allowClear placeholder="Select Admin">
              {adminOptions.map((admin) => (
                <Option key={admin} value={admin}>
                  {admin}
                </Option>
              ))}
            </Select>
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

export default Doctors;
