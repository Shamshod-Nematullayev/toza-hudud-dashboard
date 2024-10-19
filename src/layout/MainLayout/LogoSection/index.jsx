import { Link } from 'react-router-dom';

// material-ui
import ButtonBase from '@mui/material/ButtonBase';

// project imports
import config from 'config';
import Logo from 'ui-component/Logo';
import useCustomizationStore from 'store/customizationStore';

// ==============================|| MAIN LOGO ||============================== //

const LogoSection = () => {
  const { customization, setCustomization } = useCustomizationStore();

  return (
    <ButtonBase disableRipple onClick={() => setCustomization({ id: customization.defaultId })} component={Link} to={config.defaultPath}>
      <Logo />
    </ButtonBase>
  );
};

export default LogoSection;
