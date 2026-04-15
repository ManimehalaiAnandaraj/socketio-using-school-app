import React from "react";
import "../assets/mainlayout.css";
import { Form, Input, Button, Select, message,Space} from "antd";
import { useAddUserMutation, useGetUsersQuery } from "../redux/userApi";
import { toast } from "react-toastify";
import { useSelector } from "react-redux";

const { Option } = Select;

/* =========================
   PHONE INPUT FIXED
========================= */
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
        getPopupContainer={(trigger) => trigger.parentNode}
      >
        <Option value="91">+91</Option>
      </Select>

      <Input
        style={{ width: "75%" }}
        value={value.phone || ""}
        onChange={(e) => triggerChange({ phone: e.target.value })}
        placeholder="Enter phone number"
      />
    </Space.Compact>
  );
};

/* =========================
   MAIN COMPONENT
========================= */
const AddUser = () => {
  const [form] = Form.useForm();

  const { data: users = [] } = useGetUsersQuery();
  const [addUser, { isLoading: isAdding }] = useAddUserMutation();
  const currentUser = useSelector((state) => state.auth.user);

  /* =========================
     ROLE ACCESS
  ========================= */
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

  /* =========================
     SUBMIT
  ========================= */
  const onFinish = async (values) => {
    try {
      const exists = users.find((u) => u.email === values.email);

      if (exists) {
        message.error("Email already exists");
        return;
      }

      const { confirm, phone, ...rest } = values;

      const formattedData = {
        ...rest,
        phone: `+${phone.prefix}${phone.phone}`,
      };

      if (currentUser.role === "admin" && values.role === "admin") {
        return toast.error("Admin cannot create Admin");
      }

      if (currentUser.role === "student") {
        return toast.error("Student cannot create users");
      }

      await addUser(formattedData).unwrap();

      toast.success("User added successfully");
      form.resetFields();
    } catch (error) {
      toast.error("Failed to add user");
    }
  };

  /* =========================
     JSX
  ========================= */
  return (
    <div className="adduser-container">
      <h2 style={{ fontWeight: 700, marginBottom: "10px", fontSize: "20px" }}>
        Add User
      </h2>

      <Form
        form={form}
        layout="horizontal"
        labelAlign="left"
        labelCol={{ span: 10 }}
        wrapperCol={{ span: 18 }}
        style={{ maxWidth: 700 }}
        name="adduser"
        onFinish={onFinish}
        initialValues={{
          phone: { prefix: "91", phone: "" },
          gender: "male",
        }}
      >
        {/* Name */}
        <Form.Item
          name="name"
          label="Name"
          rules={[
            { required: true, message: "Please enter your name" },
            { min: 3, message: "Name must be at least 3 characters" },
          ]}
        >
          <Input placeholder="Enter your name" />
        </Form.Item>

        {/* Email */}
        <Form.Item
          name="email"
          label="E-mail"
          rules={[
            { required: true, message: "Please enter email" },
            { type: "email", message: "Invalid email format" },
          ]}
        >
          <Input placeholder="Enter your email" />
        </Form.Item>

        {/* Password */}
        <Form.Item
          name="password"
          label="Password"
          rules={[
            { required: true, message: "Please enter password" },
            { min: 6, message: "Minimum 6 characters" },
          ]}
          hasFeedback
        >
          <Input.Password placeholder="Enter password" />
        </Form.Item>

        {/* Confirm Password */}
        <Form.Item
          name="confirm"
          label="Confirm Password"
          dependencies={["password"]}
          hasFeedback
          rules={[
            { required: true, message: "Please confirm password" },
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
          <Input.Password placeholder="Confirm password" />
        </Form.Item>

        {/* Role */}
        <Form.Item
          name="role"
          label="Role"
          rules={[{ required: true, message: "Select Role" }]}
        >
          <Select
            options={getRoleOptions()}
            getPopupContainer={(trigger) => trigger.parentNode}
          />
        </Form.Item>

        {/* Phone */}
        <Form.Item
          name="phone"
          label="Phone Number"
          rules={[
            { required: true, message: "Please enter phone number" },
            {
              validator: (_, value) => {
                if (!value?.phone || value.phone.length < 10) {
                  return Promise.reject("Enter valid phone number");
                }
                return Promise.resolve();
              },
            },
          ]}
        >
          <PhoneInput />
        </Form.Item>

        {/* Gender */}
        <Form.Item
          name="gender"
          label="Gender"
          rules={[{ required: true, message: "Select gender" }]}
        >
          <Select
            options={[
              { label: "male", value: "male" },
              { label: "female", value: "female" },
              { label: "other", value: "other" },
            ]}
            getPopupContainer={(trigger) => trigger.parentNode}
          />
        </Form.Item>

        {/* Submit */}
        <Form.Item>
          <Button type="primary" htmlType="submit" loading={isAdding}>
            Add User
          </Button>
        </Form.Item>
      </Form>
    </div>
  );
};

export default AddUser;