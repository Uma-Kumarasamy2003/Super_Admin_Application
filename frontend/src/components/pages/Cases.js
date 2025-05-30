import React, { useState, useEffect } from "react";
import dayjs from "dayjs";
import "../styles/cases.css";
import {
  ReloadOutlined,
  FilterOutlined,
  EditOutlined,
  DeleteOutlined,
} from "@ant-design/icons";
import {
  Tooltip,
  Select,
  DatePicker,
  Table,
  Modal,
  Form,
  Input,
  Button,
  message,
} from "antd";
import { Resizable } from "react-resizable";

const { Option } = Select;

// Resizable column header component
const ResizableTitle = (props) => {
  const { onResize, width, ...restProps } = props;
  if (!width) return <th {...restProps} />;

  return (
    <Resizable
      width={width}
      height={0}
      handle={
        <span
          className="react-resizable-handle"
          onClick={(e) => e.stopPropagation()}
        />
      }
      onResize={onResize}
      draggableOpts={{ enableUserSelectHack: false }}
    >
      <th {...restProps} />
    </Resizable>
  );
};

const initialColumns = [
  {
    title: "Tags",
    dataIndex: "tags",
    key: "tags",
    width: 80,
    className: "custom-cell",
    render: (tag) => <span className={`dot ${tag}`} />,
  },
  {
    title: "Patient ID",
    dataIndex: "patientId",
    key: "patientId",
    width: 120,
    className: "custom-cell",
  },
  {
    title: "Patient Name",
    dataIndex: "patientName",
    key: "patientName",
    width: 150,
    className: "custom-cell",
  },
  {
    title: "Study",
    dataIndex: "study",
    key: "study",
    width: 100,
    className: "custom-cell",
  },
  {
    title: "Scan Center",
    dataIndex: "scanCenter",
    key: "scanCenter",
    width: 150,
    className: "custom-cell",
  },
  {
    title: "Date Uploaded",
    dataIndex: "dateUploaded",
    key: "dateUploaded",
    width: 160,
    className: "custom-cell",
  },
  {
    title: "Assigned Doctor",
    dataIndex: "doctor",
    key: "doctor",
    width: 160,
    className: "custom-cell",
  },
  {
    title: "Due Time",
    dataIndex: "dueTime",
    key: "dueTime",
    width: 130,
    className: "custom-cell",
  },
  {
    title: "Reported Time",
    dataIndex: "reportedTime",
    key: "reportedTime",
    width: 150,
    className: "custom-cell",
  },
  {
    title: "Status",
    dataIndex: "status",
    key: "status",
    width: 120,
    className: "custom-cell",
    render: (status) => (
      <span className={`status ${status.toLowerCase()}`}>{status}</span>
    ),
  },
];

const initialDataSource = [
  {
    key: "1",
    tags: "green",
    patientId: "0120",
    patientName: "SIVA",
    study: "CT",
    scanCenter: "Scancenter1",
    dateUploaded: "12-May-25 02:14",
    doctor: "Nivethitha He...",
    dueTime: "20 h 10 m",
    reportedTime: "NA",
    status: "Assigned",
  },
  // Add more rows here if needed
];

const Cases = () => {
  const [columns, setColumns] = useState(initialColumns);
  const [doctorNames, setDoctorNames] = useState([]);
  const [scanTypes, setScanTypes] = useState([]);
  const [bodyParts, setBodyParts] = useState([]);
  const [scanCentres, setScanCentres] = useState([]);
  const [filtersVisible, setFiltersVisible] = useState(true);
  const [dataSource, setDataSource] = useState(initialDataSource);
  const [loading, setLoading] = useState(false);

  // For modal form control
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [editingRecord, setEditingRecord] = useState(null);

  // Antd form instance
  const [form] = Form.useForm();

  useEffect(() => {
    // Load doctor names from localStorage
    const storedDoctorData = localStorage.getItem("doctorData");
    if (storedDoctorData) {
      const doctors = JSON.parse(storedDoctorData);
      const names = doctors.map((doc) => doc.name).filter(Boolean);
      setDoctorNames(names);
    }

    // Load metadata from localStorage
    const storedScanTypes = localStorage.getItem("scanTypes");
    const storedBodyParts = localStorage.getItem("bodyParts");
    const storedScanCentres = localStorage.getItem("scanCentres");

    if (storedScanTypes) setScanTypes(JSON.parse(storedScanTypes));
    if (storedBodyParts) setBodyParts(JSON.parse(storedBodyParts));
    if (storedScanCentres) setScanCentres(JSON.parse(storedScanCentres));
  }, []);

  const handleResize =
    (index) =>
    (e, { size }) => {
      const nextColumns = [...columns];
      nextColumns[index] = {
        ...nextColumns[index],
        width: size.width,
      };
      setColumns(nextColumns);
    };

  const mergedColumns = [
    ...columns,
    {
      title: "Action",
      key: "action",
      fixed: "right",
      width: 100,
      render: (_, record) => (
        <span style={{ color: "#085cda", cursor: "pointer", fontSize: "15px" }}>
          <EditOutlined
            style={{ marginRight: "10px" }}
            onClick={() => onEdit(record)}
          />
          <DeleteOutlined onClick={() => onDelete(record.key)} />
        </span>
      ),
    },
  ].map((col, index) => ({
    ...col,
    onHeaderCell: (column) => ({
      width: column.width,
      onResize: handleResize(index),
    }),
  }));

  // Toggle filter panel visibility
  const toggleFilters = () => {
    setFiltersVisible(!filtersVisible);
  };

  // Simulate fetching new data on reload
  const syncCases = () => {
    setLoading(true);
    setTimeout(() => {
      setDataSource((prevData) => [...prevData].reverse());
      setLoading(false);
    }, 1000);
  };

  // Open modal and set editing record
  const onEdit = (record) => {
    setEditingRecord(record);
    form.setFieldsValue({
      ...record,
      dateUploaded: record.dateUploaded, // string here, could parse if needed
    });
    setIsModalVisible(true);
  };

  // Delete handler (simple example)
  const onDelete = (key) => {
    Modal.confirm({
      title: "Are you sure you want to delete this record?",
      okText: "Yes",
      okType: "danger",
      cancelText: "No",
      onOk() {
        setDataSource((prev) => prev.filter((item) => item.key !== key));
        message.success("Deleted successfully");
      },
    });
  };

  // Modal form submission handler
  const onFinish = (values) => {
    const updatedData = dataSource.map((item) => {
      if (item.key === editingRecord.key) {
        return { ...item, ...values };
      }
      return item;
    });
    setDataSource(updatedData);
    setIsModalVisible(false);
    message.success("Record updated successfully");
    setEditingRecord(null);
  };

  // Modal cancel handler
  const handleCancel = () => {
    setIsModalVisible(false);
    setEditingRecord(null);
  };

  return (
    <div className="cases-container">
      <div className="cases-title">
        <h2>
          Cases
          <Tooltip title={filtersVisible ? "Hide Filters" : "Show Filters"}>
            <FilterOutlined
              className="icon-button"
              onClick={toggleFilters}
              style={{ cursor: "pointer", marginLeft: 10 }}
            />
          </Tooltip>
          <Tooltip title="Sync Cases">
            <ReloadOutlined
              className="icon-button"
              onClick={syncCases}
              style={{ marginLeft: 10 }}
            />
          </Tooltip>
        </h2>
      </div>

      {filtersVisible && (
        <div className="filters">
          {[{ label: "Patient ID" }, { label: "Patient Name" }].map(
            ({ label }) => (
              <div className="each_filters" key={label}>
                <label>{label}</label>
                <input type="text" placeholder={label} />
              </div>
            )
          )}

          <div className="each_filters">
            <label>Scan Type</label>
            <Select
              className="custom-select"
              placeholder="Scan Type"
              allowClear
            >
              {scanTypes.map((scan) => (
                <Option key={scan.id} value={scan.name}>
                  {scan.name}
                </Option>
              ))}
            </Select>
          </div>

          <div className="each_filters">
            <label>Body Part</label>
            <Select
              className="custom-select"
              placeholder="Body Part"
              allowClear
            >
              {bodyParts.map((part) => (
                <Option key={part.id} value={part.name}>
                  {part.name}
                </Option>
              ))}
            </Select>
          </div>

          <div className="each_filters">
            <label>Scan Centre</label>
            <Select
              className="custom-select"
              placeholder="Scan Centre"
              allowClear
            >
              {scanCentres.map((centre) => (
                <Option key={centre.id} value={centre.name}>
                  {centre.name}
                </Option>
              ))}
            </Select>
          </div>

          <div className="each_filters">
            <label>Doctor</label>
            <Select className="custom-select" placeholder="Doctor" allowClear>
              {doctorNames.map((name) => (
                <Option key={name} value={name}>
                  {name}
                </Option>
              ))}
            </Select>
          </div>

          <div className="each_filters">
            <label>Status</label>
            <Select className="custom-select" placeholder="Status" allowClear>
              <Option value="Assigned">Assigned</Option>
              <Option value="Unassigned">Unassigned</Option>
              <Option value="Reported">Reported</Option>
              <Option value="To be approved">To be approved</Option>
              <Option value="Report Pending">Report Pending</Option>
            </Select>
          </div>

          <div className="each_filters">
            <label>Tag</label>
            <Select className="custom-select" placeholder="Tag" allowClear>
              <Option value="urgent">Urgent</Option>
              <Option value="critical">Critical</Option>
              <Option value="interesting">Interesting</Option>
              <Option value="case_opened">Case Opened</Option>
            </Select>
          </div>

          <div className="each_filters">
            <label>From Date</label>
            <DatePicker
              defaultValue={dayjs()}
              format="DD/MM/YYYY"
              style={{ width: "100%" }}
            />
          </div>
          <div className="each_filters">
            <label>To Date</label>
            <DatePicker
              defaultValue={dayjs()}
              format="DD/MM/YYYY"
              style={{ width: "100%" }}
            />
          </div>
        </div>
      )}

      <Table
        bordered
        loading={loading}
        components={{
          header: {
            cell: ResizableTitle,
          },
        }}
        columns={mergedColumns}
        dataSource={dataSource}
        scroll={{ x: "max-content" }}
        pagination={{
          pageSize: 10,
          showSizeChanger: true,
          pageSizeOptions: ["10", "20", "50"],
        }}
      />

      <Modal
        title="Edit Case"
        visible={isModalVisible}
        onCancel={handleCancel}
        footer={null}
        destroyOnClose
        className="admin-modal"
        width={700}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={onFinish}
          initialValues={editingRecord || {}}
          className="admin-form"
          requiredMark={false}
        >
          <Form.Item
            name="tags"
            label="Tags"
            rules={[{ required: true, message: "Please input tag!" }]}
            className="features-field"
          >
            <Select>
              <Option value="green">Case Opened</Option>
              <Option value="red">Urgent</Option>
              <Option value="orange">Critical</Option>
              <Option value="blue">Interesting</Option>
            </Select>
          </Form.Item>

          <Form.Item
            name="patientId"
            label="Patient ID"
            rules={[{ required: true, message: "Please input Patient ID!" }]}
          >
            <Input />
          </Form.Item>

          <Form.Item
            name="patientName"
            label="Patient Name"
            rules={[{ required: true, message: "Please input Patient Name!" }]}
          >
            <Input />
          </Form.Item>

          <Form.Item
            name="study"
            label="Study"
            rules={[{ required: true, message: "Please input Study!" }]}
          >
            <Input />
          </Form.Item>

          <Form.Item
            name="scanCenter"
            label="Scan Center"
            rules={[{ required: true, message: "Please input Scan Center!" }]}
          >
            <Input />
          </Form.Item>

          <Form.Item
            name="dateUploaded"
            label="Date Uploaded"
            rules={[{ required: true, message: "Please input Date Uploaded!" }]}
          >
            <Input />
          </Form.Item>

          <Form.Item
            name="doctor"
            label="Assigned Doctor"
            rules={[
              { required: true, message: "Please input Assigned Doctor!" },
            ]}
          >
            <Input />
          </Form.Item>

          <Form.Item
            name="dueTime"
            label="Due Time"
            rules={[{ required: true, message: "Please input Due Time!" }]}
          >
            <Input />
          </Form.Item>

          <Form.Item
            name="reportedTime"
            label="Reported Time"
            rules={[{ required: true, message: "Please input Reported Time!" }]}
          >
            <Input />
          </Form.Item>

          <Form.Item
            name="status"
            label="Status"
            rules={[{ required: true, message: "Please input Status!" }]}
            className="features-field"
          >
            <Select>
              <Option value="Assigned">Assigned</Option>
              <Option value="Unassigned">Unassigned</Option>
              <Option value="Reported">Reported</Option>
              <Option value="To be approved">To be approved</Option>
              <Option value="Report Pending">Report Pending</Option>
            </Select>
          </Form.Item>

          <Form.Item>
            <div className="admin-form-button">
              <Button type="primary" htmlType="submit">
                Update
              </Button>
            </div>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default Cases;
