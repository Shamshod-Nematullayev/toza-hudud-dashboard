import { useState } from 'react';

// material-ui
import { useTheme } from '@mui/material/styles';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import FormControl from '@mui/material/FormControl';
import FormHelperText from '@mui/material/FormHelperText';
import IconButton from '@mui/material/IconButton';
import InputAdornment from '@mui/material/InputAdornment';
import InputLabel from '@mui/material/InputLabel';
import OutlinedInput from '@mui/material/OutlinedInput';

// third party
import * as Yup from 'yup';
import { Formik } from 'formik';

// project imports
import AnimateButton from 'ui-component/extended/AnimateButton';

// assets
import Visibility from '@mui/icons-material/Visibility';
import VisibilityOff from '@mui/icons-material/VisibilityOff';

import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';
import api from 'utils/api';
import Cookies from 'js-cookie';
import useCustomizationStore from 'store/customizationStore';

// ============================|| FIREBASE - LOGIN ||============================ //

const AuthLogin = ({ ...others }) => {
  const theme = useTheme();
  const { setCompany, setMahallalar, setUser, applyServerCustomization } = useCustomizationStore();

  const navigate = useNavigate();
  const uint8ArrayToBase64 = (uint8Array: Uint8Array) => {
    let binary = '';
    uint8Array.forEach((byte) => {
      binary += String.fromCharCode(byte);
    });
    return btoa(binary); // Base64 ga o‘girish
  };
  const handleLogin = async (values: { email: string; password: string }) => {
    try {
      const response = await api.post('/auth/login', { login: values.email, password: values.password });
      const data = response.data;
      if (data.ok) {
        Cookies.set('accessToken', data.accessToken);
        Cookies.set('refreshToken', data.refreshToken);
        localStorage.setItem('abonentsPrefix', data.abonentsPrefix);
        if (data.customization) {
          applyServerCustomization(data.customization);
        }
        if (data.user) {
          setUser({ ...data.user, id: data.user._id || data.user.id || '', avatar: '' });
        }
        if (data.company) {
          setCompany(data.company);
        }
        navigate('/');
      } else {
        toast.error(data.message || 'Login yoki parol noto‘g‘ri');
      }
    } catch (error: any) {
      console.error('Login xatosi:', error);
      if (!error?.response) {
        toast.error("Server bilan aloqa o'rnatib bo'lmadi. Server ishlamayotgan bo'lishi mumkin yoki internet aloqangizni tekshiring.");
      } else {
        const status = error.response.status;
        const msg = error.response.data?.message;
        if (status >= 500) {
          toast.error(msg || "Serverda ichki xatolik yuz berdi (Server error). Iltimos, administratorga murojaat qiling.");
        } else if (status === 429) {
          toast.error("Juda ko'p urinish amalga oshirildi. Iltimos, birozdan so'ng qayta urinib ko'ring.");
        } else if (status === 401 || status === 400 || status === 403) {
          toast.error(msg || "Login yoki parol noto‘g‘ri");
        } else {
          toast.error(msg || `Kutilmagan xatolik yuz berdi (${status})`);
        }
      }
    }
  };

  const [showPassword, setShowPassword] = useState(false);
  const handleClickShowPassword = () => {
    setShowPassword(!showPassword);
  };

  const handleMouseDownPassword = (event: React.MouseEvent<HTMLButtonElement>) => {
    event.preventDefault();
  };

  return (
    <>
      <Formik
        initialValues={{
          email: '',
          password: '',
          submit: null
        }}
        validationSchema={Yup.object().shape({
          email: Yup.string().max(255).required('Email is required'),
          password: Yup.string().max(255).required('Password is required')
        })}
        onSubmit={handleLogin}
      >
        {({ errors, handleBlur, handleChange, handleSubmit, isSubmitting, touched, values }) => (
          <form noValidate onSubmit={handleSubmit} {...others}>
            <FormControl fullWidth error={Boolean(touched.email && errors.email)} sx={{ ...(theme.typography as any)?.customInput }}>
              <InputLabel htmlFor="outlined-adornment-email-login">Email Address / Username</InputLabel>
              <OutlinedInput
                id="outlined-adornment-email-login"
                type="email"
                value={values.email}
                name="email"
                onBlur={handleBlur}
                onChange={handleChange}
                label="Email Address / Username"
                inputProps={{}}
              />
              {touched.email && errors.email && (
                <FormHelperText error id="standard-weight-helper-text-email-login">
                  {errors.email}
                </FormHelperText>
              )}
            </FormControl>

            <FormControl fullWidth error={Boolean(touched.password && errors.password)} sx={{ ...(theme.typography as any)?.customInput }}>
              <InputLabel htmlFor="outlined-adornment-password-login">Password</InputLabel>
              <OutlinedInput
                id="outlined-adornment-password-login"
                type={showPassword ? 'text' : 'password'}
                value={values.password}
                name="password"
                onBlur={handleBlur}
                onChange={handleChange}
                endAdornment={
                  <InputAdornment position="end">
                    <IconButton
                      type="button"
                      aria-label="toggle password visibility"
                      onClick={handleClickShowPassword}
                      onMouseDown={handleMouseDownPassword}
                      edge="end"
                      size="large"
                    >
                      {showPassword ? <Visibility /> : <VisibilityOff />}
                    </IconButton>
                  </InputAdornment>
                }
                label="Password"
                inputProps={{}}
              />
              {touched.password && errors.password && (
                <FormHelperText error id="standard-weight-helper-text-password-login">
                  {errors.password}
                </FormHelperText>
              )}
            </FormControl>

            {errors.submit && (
              <Box sx={{ mt: 3 }}>
                <FormHelperText error>{errors.submit}</FormHelperText>
              </Box>
            )}

            <Box sx={{ mt: 2 }}>
              <AnimateButton>
                <Button disableElevation disabled={isSubmitting} fullWidth size="large" type="submit" variant="contained" color="secondary">
                  Kirish
                </Button>
              </AnimateButton>
            </Box>
          </form>
        )}
      </Formik>
    </>
  );
};

export default AuthLogin;
