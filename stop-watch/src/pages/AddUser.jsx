import React from "react";
import { Form, Input, Button, Select, message, Space, Modal } from "antd";
import { useAddUserMutation, useGetUsersQuery } from "../redux/userApi";
import { toast } from "react-toastify";
import { useSelector } from "react-redux";


const { Option } = Select;

/* PHONE INPUT */
const PhoneInput = ({ value = {}, onChange }) => {
  const triggerChange = (changedValue) => {
    onChange?.({
      prefix: value.prefix || "91",
      phone: value.phone || "",
      ...changedValue,
    });
  };

  return (
    <Space.Compact style={{ width: "100%" }}>
      <Select
        value={value.prefix || "91"}
        style={{ width: "25%" }}
        onChange={(val) => triggerChange({ prefix: val })}
      >
        <Option value="91">+91</Option>
      </Select>

      <Input
        style={{ width: "75%" }}
        value={value.phone || ""}
        onChange={(e) => triggerChange({ phone: e.target.value })}
      />
    </Space.Compact>
  );
};

const AddUser = ({ open, onClose, onSuccess }) => {
  const [form] = Form.useForm();
  const { data: users = [] } = useGetUsersQuery();
  const [addUser, { isLoading }] = useAddUserMutation();
  const currentUser = useSelector((state) => state.auth.user);

  const getRoleOptions = () => {
    if (currentUser?.role === "superadmin") {
      return [
        { label: "admin", value: "admin" },
        { label: "staff", value: "staff" },
        { label: "student", value: "student" },
      ];
    }
    if (currentUser?.role === "admin") {
      return [
        { label: "staff", value: "staff" },
        { label: "student", value: "student" },
      ];
    }
    if (currentUser?.role === "staff") {
      return [{ label: "student", value: "student" }];
    }
    return [];
  };

  const onFinish = async (values) => {
    try {
      const exists = users.find((u) => u.email === values.email);

      if (exists) {
        return message.error("Email already exists");
      }

      const { confirm, phone, ...rest } = values;

      const formattedData = {
        ...rest,
        phone: `+${phone.prefix}${phone.phone}`,
      };

      await addUser(formattedData).unwrap();

      toast.success("User added successfully");
      form.resetFields();
      onSuccess?.();
    } catch (error) {
      toast.error("Failed to add user");
    }
  };

  return (
    
      <div className="adduser-container">
        <Form form={form} layout="vertical" onFinish={onFinish}>
          <Form.Item name="name" label="Name" rules={[{ required: true }]}>
            <Input />
          </Form.Item>

          <Form.Item name="email" label="Email" rules={[{ required: true }]}>
            <Input />
          </Form.Item>

          <Form.Item name="password" label="Password" rules={[{ required: true }]}>
            <Input.Password />
          </Form.Item>

          <Form.Item
            name="confirm"
            label="Confirm Password"
            dependencies={["password"]}
            rules={[
              { required: true },
              ({ getFieldValue }) => ({
                validator(_, value) {
                  if (!value || getFieldValue("password") === value) {
                    return Promise.resolve();
                  }
                  return Promise.reject("Passwords do not match");
                },
              }),
            ]}
          >
            <Input.Password />
          </Form.Item>

          <Form.Item name="role" label="Role" rules={[{ required: true }]}>
            <Select options={getRoleOptions()} />
          </Form.Item>

          <Form.Item name="phone" label="Phone" rules={[{ required: true }]}>
            <PhoneInput />
          </Form.Item>

          <Form.Item name="gender" label="Gender" rules={[{ required: true }]}>
            <Select
              options={[
                { label: "male", value: "male" },
                { label: "female", value: "female" },
                { label: "other", value: "other" },
              ]}
            />
          </Form.Item>

          <Button type="primary" htmlType="submit" loading={isLoading} block>
            Add User
          </Button>
        </Form>
      </div>
    
  );
};

export default AddUser;