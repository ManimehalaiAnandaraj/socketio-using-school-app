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
} from "antd";
import {
  UserAddOutlined,
  UploadOutlined,
  DownloadOutlined,
} from "@ant-design/icons";

import {
  useGetUsersQuery,
  useDeleteUserMutation,
  useUpdateUserMutation,
  useCreateUserMutation,
} from "../redux/userApi";

import { useSelector } from "react-redux";
import AddUser from "./AddUser";

/* ================= CSV HELPERS ================= */

const toCSV = (rows) => {
  if (!rows.length) return "";

  const headers = ["name", "email", "phone", "role", "gender"];

  const lines = [
    headers.join(","),

    ...rows.map((r) =>
      headers
        .map((h) => {
          let val = r[h] ?? "";

          // ✅ FORCE PHONE AS TEXT (prevents scientific notation in Excel)
          if (h === "phone" && val) {
            val = `="${val}"`;
          }

          return /[",\n]/.test(val)
            ? `"${val.replace(/"/g, '""')}"`
            : val;
        })
        .join(",")
    ),
  ];

  return lines.join("\n");
};

const parseCSV = (text) => {
  const [headerLine, ...lines] = text.trim().split(/\r?\n/);
  const headers = headerLine.split(",").map((h) => h.trim().toLowerCase());

  return lines
    .filter((l) => l.trim())
    .map((line) => {
      const values = [];
      let current = "";
      let insideQuote = false;

      for (let ch of line) {
        if (ch === '"') insideQuote = !insideQuote;
        else if (ch === "," && !insideQuote) {
          values.push(current.trim());
          current = "";
        } else current += ch;
      }
      values.push(current.trim());

      return Object.fromEntries(headers.map((h, i) => [h, values[i] || ""]));
    });
};

// ✅ remove duplicate emails inside CSV
const removeDuplicates = (rows) => {
  const seen = new Set();
  return rows.filter((row) => {
    const key = row.email?.toLowerCase();
    if (!key || seen.has(key)) return false;
    seen.add(key);
    return true;
  });
};

/* ================= COMPONENT ================= */

const AllUser = () => {
  const { data, isLoading, refetch } = useGetUsersQuery();
  const users = data || [];

  const [deleteUser] = useDeleteUserMutation();
  const [updateUser] = useUpdateUserMutation();
  const [createUser] = useCreateUserMutation();

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState(null);

  const [importModalOpen, setImportModalOpen] = useState(false);
  const [importPreview, setImportPreview] = useState([]);
  const [importLoading, setImportLoading] = useState(false);

  const fileInputRef = useRef(null);

  const [searchText, setSearchText] = useState("");
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

  const filteredUsers = users.filter(
    (u) =>
      u.name?.toLowerCase().includes(searchText.toLowerCase()) ||
      u.email?.toLowerCase().includes(searchText.toLowerCase()) ||
      u.role?.toLowerCase().includes(searchText.toLowerCase()) ||
      u.gender?.toLowerCase().includes(searchText.toLowerCase())
  );

  /* ================= EXPORT ================= */

  const handleExport = () => {
    if (!users.length) return message.warning("No users");

    const blob = new Blob([toCSV(users)], { type: "text/csv" });
    const url = URL.createObjectURL(blob);

    const link = document.createElement("a");
    link.href = url;
    link.download = "users.csv";
    link.click();

    URL.revokeObjectURL(url);
  };

  /* ================= IMPORT ================= */

  const handleImportFileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.name.endsWith(".csv")) {
      message.error("Upload CSV file");
      return;
    }

    const reader = new FileReader();
    reader.onload = (ev) => {
      try {
        const parsed = parseCSV(ev.target.result);
        setImportPreview(parsed);
        setImportModalOpen(true);
      } catch {
        message.error("CSV parse error");
      }
    };

    reader.readAsText(file);
    e.target.value = "";
  };

  const handleImportConfirm = async () => {
  setImportLoading(true);

  let created = 0;
  let skipped = 0;
  let failed = 0;

  try {
    // Step 1: clean + normalize CSV data
    const cleanData = removeDuplicates(
      importPreview.map((row) => ({
        name: row.name?.trim(),
        email: row.email?.trim().toLowerCase(),
        phone: row.phone?.toString().replace(/^="?|"?$/g, "").trim(),
        role: row.role?.trim(),
        gender: row.gender?.trim(),
        password:"123456",
      }))
    );

    // Step 2: build a Set of existing emails for fast lookup
    const existingEmails = new Set(
      users
        .filter((u) => u.email)
        .map((u) => u.email.trim().toLowerCase())
    );

    // Step 3: only create rows whose email is NOT already in the table
    for (const row of cleanData) {
      if (!row.email) {
        failed++;
        continue;
      }

      if (existingEmails.has(row.email)) {
        skipped++;       // ← already exists, do nothing
        continue;
      }

      try {
        await createUser(row).unwrap();
        created++;
      } catch (err) {
        console.log("Import error:", err);
        failed++;
      }
    }

    message.success(
      `Created: ${created}, Skipped (already exist): ${skipped}, Failed: ${failed}`
    );

    refetch();
  } catch (err) {
    message.error("Import failed");
  }

  setImportLoading(false);
  setImportModalOpen(false);
  setImportPreview([]);
};

  /* ================= DELETE ================= */

  const handleDelete = async (id) => {
    await deleteUser(id);
  };

  /* ================= EDIT ================= */

  const handleEdit = (record) => {
    setEditingUser(record);
    form.setFieldsValue(record);
    setIsModalOpen(true);
  };

  const handleUpdate = async () => {
    const values = await form.validateFields();
    await updateUser({ id: editingUser._id, ...values });
    setIsModalOpen(false);
    form.resetFields();
  };

  /* ================= TABLE ================= */

  const columns = [
    { title: "Name", dataIndex: "name" },
    { title: "Email", dataIndex: "email" },
    { title: "Phone Number", dataIndex: "phone" },
    { title: "Role", dataIndex: "role" },
    { title: "Gender", dataIndex: "gender" },
    ...(canEdit
      ? [
          {
            title: "Actions",
            render: (_, r) => (
              <Space>
                <Button onClick={() => handleEdit(r)}>Edit</Button>
                {canDelete && (
                  <Popconfirm
                    title="Delete?"
                    onConfirm={() => handleDelete(r._id)}
                  >
                    <Button danger>Delete</Button>
                  </Popconfirm>
                )}
              </Space>
            ),
          },
        ]
      : []),
  ];

  /* ================= UI ================= */

  return (
    <div className="allusers-container">

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

          <input
            ref={fileInputRef}
            type="file"
            accept=".csv"
            style={{ display: "none" }}
            onChange={handleImportFileChange}
          />

          <Button onClick={() => fileInputRef.current?.click()}>
            <UploadOutlined /> Import
          </Button>

          <Button onClick={handleExport}>
            <DownloadOutlined /> Export
          </Button>

          {canAddUser && (
            <Button
              type="primary"
              onClick={() => setIsAddModalOpen(true)}
            >
              <UserAddOutlined /> Add User
            </Button>
          )}
        </div>
      </div>

      <Table
        columns={columns}
        dataSource={filteredUsers}
        loading={isLoading}
        rowKey="_id"
      />

      {/* ADD */}
      <Modal
        open={isAddModalOpen}
        footer={null}
        onCancel={() => setIsAddModalOpen(false)}
      >
        <AddUser onSuccess={() => setIsAddModalOpen(false)} />
      </Modal>

      {/* EDIT */}
      <Modal
        open={isModalOpen}
        onOk={handleUpdate}
        onCancel={() => setIsModalOpen(false)}
      >
        <Form form={form} layout="vertical">
          <Form.Item name="name" label="Name"><Input /></Form.Item>
          <Form.Item name="email" label="Email"><Input /></Form.Item>
          <Form.Item name="phone" label="Phone"><Input /></Form.Item>
          <Form.Item name="role" label="Role"><Input /></Form.Item>
          <Form.Item name="gender" label="Gender"><Input /></Form.Item>
        </Form>
      </Modal>

      {/* IMPORT */}
      <Modal
        open={importModalOpen}
        onCancel={() => setImportModalOpen(false)}
        onOk={handleImportConfirm}
        confirmLoading={importLoading}
        width={800}
      >
        <Table
          dataSource={importPreview}
          rowKey={(_, i) => i}
          columns={[
            { title: "Name", dataIndex: "name" },
            { title: "Email", dataIndex: "email" },
            { title: "Phone", dataIndex: "phone" },
            { title: "Role", dataIndex: "role" },
            { title: "Gender", dataIndex: "gender" },
          ]}
        />
      </Modal>

    </div>
  );
};

export default AllUser;