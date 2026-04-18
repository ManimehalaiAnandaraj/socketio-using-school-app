import React, { useState, useRef } from "react";
import {
  Table,
  Button,
  Space,
  Modal,
  Form,
  Input,
  Popconfirm,
  Select,
  message,
  Upload,
} from "antd";
import { UserAddOutlined, UploadOutlined, DownloadOutlined } from "@ant-design/icons";

import {
  useGetUsersQuery,
  useDeleteUserMutation,
  useUpdateUserMutation,
  useCreateUserMutation, 
} from "../redux/userApi";

import { useSelector } from "react-redux";
import AddUser from "./AddUser";

// ─── CSV Helpers ──────────────────────────────────────────────────────────────

/** Convert an array of objects to a CSV string */
const toCSV = (rows) => {
  if (!rows.length) return "";
  const headers = ["name", "email", "phone", "role", "gender"];
  const lines = [
    headers.join(","),
    ...rows.map((r) =>
      headers
        .map((h) => {
          const val = r[h] ?? "";
          // Wrap in quotes if value contains comma, quote, or newline
          return /[",\n]/.test(val) ? `"${val.replace(/"/g, '""')}"` : val;
        })
        .join(",")
    ),
  ];
  return lines.join("\n");
};

/** Parse a CSV string into an array of objects (uses first row as headers) */
const parseCSV = (text) => {
  const [headerLine, ...dataLines] = text.trim().split(/\r?\n/);
  const headers = headerLine.split(",").map((h) => h.trim().toLowerCase());

  return dataLines
    .filter((line) => line.trim())
    .map((line) => {
      // Simple CSV parse — handles quoted fields
      const values = [];
      let current = "";
      let insideQuote = false;
      for (let i = 0; i < line.length; i++) {
        const ch = line[i];
        if (ch === '"') {
          insideQuote = !insideQuote;
        } else if (ch === "," && !insideQuote) {
          values.push(current.trim());
          current = "";
        } else {
          current += ch;
        }
      }
      values.push(current.trim());

      return Object.fromEntries(headers.map((h, i) => [h, values[i] ?? ""]));
    });
};

// ─── Component ────────────────────────────────────────────────────────────────

const AllUser = () => {
  const { data, isLoading, refetch } = useGetUsersQuery();
  const users = data || [];

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [deleteUser] = useDeleteUserMutation();
  const [updateUser] = useUpdateUserMutation();

  // If your API supports bulk create, wire this up; otherwise we skip import API call
  // and just show a preview modal.
  const [createUser] = useCreateUserMutation?.() ?? [null];

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState(null);

  // Import state
  const [importModalOpen, setImportModalOpen] = useState(false);
  const [importPreview, setImportPreview] = useState([]); // parsed rows
  const [importLoading, setImportLoading] = useState(false);
  const fileInputRef = useRef(null);

  const [searchText, setSearchText] = useState("");
  const filteredUsers = users.filter(
    (user) =>
      user.name?.toLowerCase().includes(searchText.toLowerCase()) ||
      user.email?.toLowerCase().includes(searchText.toLowerCase()) ||
      user.gender?.toLowerCase().includes(searchText.toLowerCase()) ||
      user.role?.toLowerCase().includes(searchText.toLowerCase())
  );

  const [form] = Form.useForm();

  const currentUser = useSelector((state) => state.auth.user);
  const isSuperAdmin = currentUser?.role === "superadmin";
  const isAdmin = currentUser?.role === "admin";
  const canEdit = isSuperAdmin || isAdmin;
  const canDelete = isSuperAdmin;
  const canAddUser =
    currentUser?.role === "superadmin" ||
    currentUser?.role === "admin" ||
    currentUser?.role === "staff";

  // ── Export ──────────────────────────────────────────────────────────────────

  const handleExport = () => {
    if (!users.length) {
      message.warning("No users to export.");
      return;
    }
    const csv = toCSV(users);
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `users_${new Date().toISOString().slice(0, 10)}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    message.success("Users exported successfully!");
  };

  // ── Import ──────────────────────────────────────────────────────────────────

  const handleImportFileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.name.endsWith(".csv")) {
      message.error("Please upload a valid .csv file.");
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const parsed = parseCSV(event.target.result);
        if (!parsed.length) {
          message.error("CSV file is empty or unreadable.");
          return;
        }
        setImportPreview(parsed);
        setImportModalOpen(true);
      } catch {
        message.error("Failed to parse CSV. Please check the file format.");
      }
    };
    reader.readAsText(file);
    // Reset so same file can be re-selected
    e.target.value = "";
  };

  const handleImportConfirm = async () => {
    if (!createUser) {
      // No bulk create API — show a notice and close
      message.info(
        "Import preview complete. Wire up createUser mutation to persist data."
      );
      setImportModalOpen(false);
      return;
    }

    setImportLoading(true);
    let successCount = 0;
    let failCount = 0;

    for (const row of importPreview) {
      try {
        await createUser(row).unwrap();
        successCount++;
      } catch {
        failCount++;
      }
    }

    setImportLoading(false);
    setImportModalOpen(false);
    setImportPreview([]);
    refetch();

    if (successCount)
      message.success(`${successCount} user(s) imported successfully!`);
    if (failCount)
      message.error(`${failCount} user(s) failed to import.`);
  };

  // ── Download sample template ─────────────────────────────────────────────

  const handleDownloadTemplate = () => {
    const sample = toCSV([
      {
        name: "Jane Doe",
        email: "jane@example.com",
        phone: "9876543210",
        role: "student",
        gender: "Female",
      },
    ]);
    const blob = new Blob([sample], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "import_template.csv";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  // ── Edit / Delete ────────────────────────────────────────────────────────

  const handleDelete = async (id) => {
    await deleteUser(id);
  };

  const handleEdit = (record) => {
    setEditingUser(record);
    form.setFieldsValue({
      name: record.name,
      email: record.email,
      role: record.role,
      phone: record.phone,
      gender: record.gender,
    });
    setIsModalOpen(true);
  };

  const handleUpdate = async () => {
    const values = await form.validateFields();
    await updateUser({ id: editingUser._id, ...values });
    setIsModalOpen(false);
    form.resetFields();
  };

  // ── Columns ──────────────────────────────────────────────────────────────

  const baseColumns = [
    { title: "Name", dataIndex: "name" },
    { title: "Email", dataIndex: "email" },
    { title: "Phone Number", dataIndex: "phone" },
    { title: "Role", dataIndex: "role" },
    { title: "Gender", dataIndex: "gender" },
  ];

  const actionColumn = {
    title: "Actions",
    render: (_, record) => (
      <Space>
        {canEdit && (
          <Button type="primary" onClick={() => handleEdit(record)}>
            Edit
          </Button>
        )}
        {canDelete && (
          <Popconfirm
            title="Are you sure to delete?"
            onConfirm={() => handleDelete(record._id)}
          >
            <Button danger>Delete</Button>
          </Popconfirm>
        )}
      </Space>
    ),
  };

  const columns = canEdit ? [...baseColumns, actionColumn] : baseColumns;

  // ── Import preview columns ───────────────────────────────────────────────

  const importColumns = [
    { title: "Name", dataIndex: "name" },
    { title: "Email", dataIndex: "email" },
    { title: "Phone", dataIndex: "phone" },
    { title: "Role", dataIndex: "role" },
    { title: "Gender", dataIndex: "gender" },
  ];

  // ── Render ───────────────────────────────────────────────────────────────

  return (
    <div className="allusers-container">

      {/* NAVBAR */}
      <div className="user-navbar">
        <div className="nav-left">
          <h2>All Users</h2>
        </div>
        <div className="nav-right">
          <Input
            placeholder="Search users..."
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            style={{ width: 200 }}
          />

          {/* Hidden native file input for CSV upload */}
          <input
            ref={fileInputRef}
            type="file"
            accept=".csv"
            style={{ display: "none" }}
            onChange={handleImportFileChange}
          />

          {/* Import Button — triggers file picker */}
          <Button
            icon={<UploadOutlined />}
            onClick={() => fileInputRef.current?.click()}
          >
            Import
          </Button>

          {/* Export Button — downloads CSV of current users */}
          <Button
            icon={<DownloadOutlined />}
            onClick={handleExport}
          >
            Export
          </Button>

          {canAddUser && (
            <Button
              type="primary"
              icon={<UserAddOutlined />}
              onClick={() => setIsAddModalOpen(true)}
            >
              Add User
            </Button>
          )}
        </div>
      </div>

      {/* ADD USER MODAL */}
      <Modal
        title="Add User"
        open={isAddModalOpen}
        onCancel={() => setIsAddModalOpen(false)}
        footer={null}
        className="custom-modal"
        getContainer={document.body}
        destroyOnClose
        styles={{
          content: { padding: 0 },
          header: { padding: "16px 20px", marginBottom: 0 },
          body: { padding: 0 },
        }}
      >
        <AddUser onSuccess={() => setIsAddModalOpen(false)} />
      </Modal>

      {/* TABLE */}
      <Table
        columns={columns}
        dataSource={filteredUsers}
        loading={isLoading}
        rowKey="_id"
        scroll={{ x: 900 }}
        pagination={{ pageSize: 10 }}
      />

      {/* EDIT MODAL */}
      <Modal
        title="Edit User"
        open={isModalOpen}
        onOk={handleUpdate}
        onCancel={() => setIsModalOpen(false)}
        className="custom-modal"
        getContainer={document.body}
        destroyOnClose
        styles={{
          content: { padding: 0 },
          header: { padding: "16px 20px", marginBottom: 0 },
          body: { padding: "20px" },
        }}
      >
        <Form form={form} layout="vertical">
          <Form.Item name="name" label="Name">
            <Input />
          </Form.Item>
          <Form.Item name="email" label="Email">
            <Input />
          </Form.Item>
          {isSuperAdmin && (
            <Form.Item name="role" label="Role">
              <Select
                options={[
                  { label: "Admin", value: "admin" },
                  { label: "Staff", value: "staff" },
                  { label: "Student", value: "student" },
                ]}
              />
            </Form.Item>
          )}
          <Form.Item name="phone" label="Phone">
            <Input />
          </Form.Item>
          <Form.Item name="gender" label="Gender">
            <Select
              options={[
                { label: "Male", value: "Male" },
                { label: "Female", value: "Female" },
                { label: "Other", value: "Other" },
              ]}
            />
          </Form.Item>
        </Form>
      </Modal>

      {/* IMPORT PREVIEW MODAL */}
      <Modal
        title={`Import Preview — ${importPreview.length} user(s) found`}
        open={importModalOpen}
        onCancel={() => {
          setImportModalOpen(false);
          setImportPreview([]);
        }}
        width={800}
        footer={[
          <Button key="template" onClick={handleDownloadTemplate}>
            Download Template
          </Button>,
          <Button
            key="cancel"
            onClick={() => {
              setImportModalOpen(false);
              setImportPreview([]);
            }}
          >
            Cancel
          </Button>,
          <Button
            key="confirm"
            type="primary"
            loading={importLoading}
            onClick={handleImportConfirm}
          >
            Confirm Import
          </Button>,
        ]}
      >
        <p style={{ marginBottom: 12, color: "#666" }}>
          Review the data below before confirming. Only rows with valid fields
          will be imported.
        </p>
        <Table
          columns={importColumns}
          dataSource={importPreview}
          rowKey={(_, i) => i}
          size="small"
          pagination={{ pageSize: 5 }}
          scroll={{ x: 600 }}
        />
      </Modal>

    </div>
  );
};

export default AllUser;