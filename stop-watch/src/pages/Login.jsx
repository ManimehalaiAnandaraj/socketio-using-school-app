import React, { useState } from 'react';
import {
  
  Button, 
  Form,
  Input,
  Flex,
  message,

} from 'antd';
import { useNavigate }  from 'react-router-dom';
import { useLoginUserMutation } from '../redux/userApi';
import { useDispatch } from 'react-redux';
import { setUser } from '../redux/authSlice';
import { toast } from 'react-toastify';




const formItemLayout = {
  labelCol: {
    xs: { span: 24 },
    sm: { span: 8 },
  },
  wrapperCol: {
    xs: { span: 24 },
    sm: { span: 16 },
  },
};
const tailFormItemLayout = {
  wrapperCol: {
    xs: {
      span: 24,
      offset: 0,
    },
    sm: {
      span: 16,
      offset: 8,
    },
  },
};
  
const Login = () => {
    const navigate = useNavigate();

  const [form] = Form.useForm();
 
  const [loginUser , {isLoading}] = useLoginUserMutation();

  const dispatch = useDispatch();
  
 const onFinish = async (values) => {
  try {
    const res = await loginUser(values).unwrap();

    console.log("Login Success:", res);

    localStorage.setItem("user", JSON.stringify(res.user));

    dispatch(setUser(res.user));
    toast.success("Login successful"); 

    navigate("/dashboard");

  } catch (err) {
    console.error(err);
    toast.error(err?.data?.message || "Login Failed");
  }
};

  return (
    <div className='Login-container'>
    <Form
      {...formItemLayout}
      form={form}
      name="login"
      layout='horizontal'
      labelAlign='left'
      onFinish={onFinish}
      style={{
 maxWidth: 400,
  padding:"30px",
  margin: "100px auto",
   borderRadius: "12px",
    boxShadow: "0 8px 24px rgba(0, 0, 0, 0.12)"
}}
      scrollToFirstError
    >
        <h2 style={{marginBottom:"10px",fontWeight:700,color:"blue"}}>Login</h2>
      <Form.Item
        name="email"
        label ="E-Mail"
        rules={[
          {
            type: 'email',
            message: 'The input is not valid E-mail!',
          },
          {
            required: true,
            message: 'Please input your E-mail!',
          },
        ]}
      >
        <Input placeholder='Enter Your E-mail' />
      </Form.Item>

      <Form.Item
        name="password"
        label="Password"
        rules={[
          {
            required: true,
            message: 'Please input your password!',
          },
        ]}
        hasFeedback
      >
        <Input.Password placeholder='Enter Your Password'  />
      </Form.Item>

      <Form.Item>

       <Flex justify="flex-start">
        <Button type="primary" htmlType="submit" loading={isLoading}>
          Login
        </Button>
         </Flex>
   
      </Form.Item>
    </Form>
    </div>
  );
};
export default Login;