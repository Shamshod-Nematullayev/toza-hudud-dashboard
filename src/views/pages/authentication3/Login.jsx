import React, { useState } from 'react';
import styled from 'styled-components';
import PersonOutlineIcon from '@mui/icons-material/PersonOutline';
import { LockOpenOutlined, LockOutlined } from '@mui/icons-material';
import api from 'utils/api';
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';
import Cookies from 'js-cookie';
import { useTranslation } from 'react-i18next';
import useCustomizationStore from 'store/customizationStore';
import { GoogleLoginButton } from './GoogleLoginButton';

const Body = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  background-size: cover;
  background-repeat: no-repeat;
  font-family: sans-serif;
`;
const LoginBox = styled.div`
  position: relative;
  width: 400px;
  height: 450px;
  background-color: red;
  border: 1px solid #fff;
  border-radius: 20px;
  display: flex;
  justify-content: center;
  align-items: center;
  background-color: rgba(0, 0, 0, 0.2);
  backdrop-filter: blur(5px);
  @media (max-width: 568px) {
    width: 90%;
  }
`;
const LoginTitle = styled.h2`
  color: #fff;
  font-size: 2rem;
  text-align: center;
  margin-bottom: 60px;
`;
const InputBox = styled.div`
  position: relative;
  width: 310px;
  margin: 30px 0;
  border-bottom: 2px solid #fff;
  input:focus ~ label,
  input:valid ~ label {
    top: -5px;
  }
`;
const InputBoxLabel = styled.label`
  position: absolute;
  top: 50%;
  left: 5px;
  transform: translateY(-50%);
  color: #fff;
  font-size: 16px;
  transition: all 0.5s ease;
`;

const Input = styled.input`
  width: 100%;
  height: 50px;
  background: transparent;
  border: none;
  outline: none;
  font-size: 1em;
  color: #fff;
  padding: 0 35px 0 5px;
  &:-webkit-autofill {
    -webkit-box-shadow: 0 0 0 1000px transparent inset !important;
    -webkit-text-fill-color: #fff !important;
    transition: background-color 5000s ease-in-out 0s;
  }

  &:-webkit-autofill:focus {
    -webkit-box-shadow: 0 0 0 1000px transparent inset !important;
    -webkit-text-fill-color: #fff !important;
  }
`;

const Button = styled.button`
  width: 100%;
  height: 40px;
  color: #000;
  background-color: #fff;
  border-radius: 10px;
  outline: none;
  cursor: pointer;
  font-size: 16px;
  font-weight: bold;
  border: 1px solid #fff;
  transition: all 0.3s ease;
  &:hover {
    background-color: transparent;
    color: #fff;
  }
  &:disabled {
    background-color: #ccc;
    color: #999;
    cursor: not-allowed;
  }
`;

const Icon = styled.div`
  position: absolute;
  right: 8px;
  font-size: 20px;
  color: white;
  line-height: 57px;
`;

function Login() {
  const [showPassword, setShowPassword] = useState(false);
  const [values, setValues] = useState({ username: '', password: '' });
  const navigate = useNavigate();
  const [disabled, setDisabled] = useState(false);
  const { t } = useTranslation();
  const handleSubmit = async (e) => {
    e.preventDefault();
    setDisabled(true);
    try {
      const response = await api.post('/auth/login', { login: values.username, password: values.password });
      const data = response.data;
      if (!data.ok) return toast.error(data.message);

      toast.success('Login successful');
      Cookies.set('accessToken', data.accessToken);
      Cookies.set('refreshToken', data.refreshToken);
      if (data.photo) {
        const uint8Array = new Uint8Array(data.photo.data);
        const base64Image = `data:image/png;base64,${uint8ArrayToBase64(uint8Array)}`;
        localStorage.setItem('avatar', base64Image);
        delete data.photo;
      }
      localStorage.setItem('user', JSON.stringify(data.user));
      localStorage.setItem('company', JSON.stringify(data.company));
      localStorage.setItem('fullName', data.fullName);
      localStorage.setItem('abonentsPrefix', data.abonentsPrefix);
      navigate('/');
    } catch (error) {
      console.error(error);
      toast.error('An error occured');
    } finally {
      setDisabled(false);
    }
  };
  const handleChangeInputValue = (e) => {
    setValues({ ...values, [e.target.name]: e.target.value });
  };
  const { customization } = useCustomizationStore();
  return (
    <Body
      style={{
        backgroundImage:
          customization.mode === 'dark'
            ? 'url(https://i.pinimg.com/1200x/2c/90/a3/2c90a3402573bea4f3ba5b85c1008cc5.jpg)'
            : 'url(https://images.pexels.com/photos/11724620/pexels-photo-11724620.jpeg)'
      }}
    >
      <LoginBox>
        <form onSubmit={handleSubmit}>
          {/* <Logo
            imgSize={80}
            style={{
              textShadow: '0 0 5px #fff, 0 0 10px #fff, 0 0 15px #fff, 0 0 20px #fff, 0 0 25px #fff, 0 0 30px #fff',
              color: '#55b543'
            }}
          /> */}
          <LoginTitle>{t('tizimga kirish')}</LoginTitle>
          <InputBox>
            <Icon>
              <PersonOutlineIcon />
            </Icon>
            <Input type="text" name="username" required value={values.username} onChange={handleChangeInputValue} />
            <InputBoxLabel>{t('username')}</InputBoxLabel>
          </InputBox>
          <InputBox>
            <Icon style={{ cursor: 'pointer' }} onClick={() => setShowPassword(!showPassword)}>
              {showPassword ? <LockOpenOutlined /> : <LockOutlined />}
            </Icon>
            <Input
              type={showPassword ? 'text' : 'password'}
              name="password"
              required
              value={values.password}
              onChange={handleChangeInputValue}
            />
            <InputBoxLabel>{t('password')}</InputBoxLabel>
          </InputBox>
          <Button type="submit" disabled={disabled}>
            {t('login')}
          </Button>
          {/* Google login */}
          <GoogleLoginButton />
        </form>
      </LoginBox>
    </Body>
  );
}

const uint8ArrayToBase64 = (uint8Array) => {
  let binary = '';
  uint8Array.forEach((byte) => {
    binary += String.fromCharCode(byte);
  });
  return btoa(binary); // Base64 ga o‘girish
};

export default Login;
