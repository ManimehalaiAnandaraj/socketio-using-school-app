import React, { useState } from "react";
import {
  Table,
  Button,
  Space,
  Modal,
  Form,
  Input,
  Popconfirm,
  Select,
} from "antd";

import {
  useGetUsersQuery,
  useDeleteUserMutation,
  useUpdateUserMutation,
} from "../redux/userApi";
import { useSelector } from "react-redux";

const AllUser = () => {
  const { data, isLoading } = useGetUsersQuery();
  const users = data || [];

  const [deleteUser] = useDeleteUserMutation();
  const [updateUser] = useUpdateUserMutation();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState(null);

  const [form] = Form.useForm();

  const currentUser = useSelector((state) => state.auth.user);

  // Roles
  const isSuperAdmin = currentUser?.role === "superadmin";
  const isAdmin = currentUser?.role === "admin";
  const canEdit = isSuperAdmin || isAdmin;
  const canDelete = isSuperAdmin;

  // DELETE
  const handleDelete = async (id) => {
    await deleteUser(id);
  };

  // EDIT
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

  // UPDATE
  const handleUpdate = async () => {
    const values = await form.validateFields();

    await updateUser({
      id: editingUser._id,
      ...values,
    });

    setIsModalOpen(false);
    form.resetFields();
  };

  // BASE COLUMNS
  const baseColumns = [
    { title: "Name", dataIndex: "name" },
    { title: "Email", dataIndex: "email" },
    { title: "Phone Number", dataIndex: "phone" },
    { title: "Role", dataIndex: "role" },
    { title: "Gender", dataIndex: "gender" },
  ];

  // ACTION COLUMN (only for admin & superadmin)
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

  // FINAL COLUMNS
  const columns = canEdit
    ? [...baseColumns, actionColumn]
    : baseColumns;

  return (
    <div className="allusers-container">
      
      <h2
        style={{
          fontWeight: 700,
          marginBottom: "10px",
          fontSize: "20px",
        }}
      >
        All Users
      </h2>

      <Table
        columns={columns}
        dataSource={users}
        loading={isLoading}
        rowKey="_id"
        scroll={{ x: 900 }}
        pagination={{ pageSize: 5 }}
      />

      {/* EDIT MODAL */}
      <Modal
        title="Edit User"
        open={isModalOpen}
        onOk={handleUpdate}
        onCancel={() => setIsModalOpen(false)}
      >
        <Form form={form} layout="vertical">
          <Form.Item name="name" label="Name">
            <Input />
          </Form.Item>

          <Form.Item name="email" label="Email">
            <Input />
          </Form.Item>

          {isSuperAdmin && (
            <Form.Item
              name="role"
              label="Role"
              rules={[{ required: true, message: "Select Role" }]}
            >
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

          <Form.Item
            name="gender"
            label="Gender"
            rules={[{ required: true, message: "Select gender" }]}
          >
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
      </div>
    
  );
};

export default AllUser;