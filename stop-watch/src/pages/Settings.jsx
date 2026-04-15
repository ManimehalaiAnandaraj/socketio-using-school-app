import React, { useState, useEffect } from "react";
import { Button, Form, Input,message } from "antd";
import { useSelector } from "react-redux";
import "../assets/mainlayout.css";
import { toast } from "react-toastify";

const Settings = () => {
  const [showReset, setShowReset] = useState(false);
  const [form] = Form.useForm();

  const user = useSelector((state) => state.auth.user);

  const handleForgotPassword = () => {
    setShowReset(true);
  };

  const onFinish = async (values) => {
  try {
    if (!user?._id) {
      message.error("User not found");
      return;
    }

    const updatedUser = {
      name: values.user.name,
      email: values.user.email,
      password: values.newPassword,
    };

    console.log("Sending:", updatedUser);
    console.log("ID:", user._id);

    const res = await fetch(
      `http://localhost:5000/api/users/${user._id}`,
      {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify(updatedUser),
      }
    );

    const data = await res.json();

    if (res.ok) {
      toast.success("Password Updated Successfully");
    } else {
      toast.error(data.message || "Update Failed");
    }
  } catch (error) {
    console.log(error);
    toast.error("Something Went Wrong");
  }
};
  // Set form values when user is available
  useEffect(() => {
    if (user) {
      form.setFieldsValue({
        user: {
          name: user.name,
          email: user.email,
        },
      });
    }
  }, [user, form]);

  return (
    <div className="settings-container">
      <div className="settings-box">
        <h2 style={{fontWeight:700,marginBottom:"10px" ,fontSize:"20px",border:"none"}}>Settings</h2>

        <Form
          form={form}
          name="settings-form"
          onFinish={onFinish}
          layout="horizontal"
          labelCol={{ span: 8 }}
          wrapperCol={{ span: 16 }}
        >
          <Form.Item
            name={["user", "name"]}
            label="Name"
            rules={[{ required: true }]}
          >
            <Input />
          </Form.Item>

          <Form.Item
            name={["user", "email"]}
            label="Email"
            rules={[{ type: "email" }]}
          >
            <Input />
          </Form.Item>

          <Form.Item>
            <Button type="primary" onClick={handleForgotPassword}>
              Forgot Password
            </Button>
          </Form.Item>

          {showReset && (
            <>
              <Form.Item
                name="newPassword"
                label="New Password"
                rules={[{ required: true, min: 6 }]}
              >
                <Input.Password />
              </Form.Item>

              <Form.Item
                name="confirm"
                label="Confirm Password"
                dependencies={["newPassword"]}
                rules={[
                  { required: true },
                  ({ getFieldValue }) => ({
                    validator(_, value) {
                      if (!value || getFieldValue("newPassword") === value) {
                        return Promise.resolve();
                      }
                      return Promise.reject("Passwords do not match");
                    },
                  }),
                ]}
              >
                <Input.Password />
              </Form.Item>

              <Form.Item>
                <Button type="primary" htmlType="submit" >
                  Update Password
                </Button>
              </Form.Item>
            </>
          )}
        </Form>
      </div>
    </div>
  );
};

export default Settings;