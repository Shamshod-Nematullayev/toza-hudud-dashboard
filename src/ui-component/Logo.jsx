// material-ui
import { useTheme } from '@mui/material/styles';
import logo from 'assets/images/logo.png';
/**
 * if you want to use image instead of <svg> uncomment following.
 *
 * import logoDark from 'assets/images/logo-dark.svg';
 * import logo from 'assets/images/logo.svg';
 *
 */

// ==============================|| LOGO SVG ||============================== //

const Logo = ({ style, imgSize }) => {
  const theme = useTheme();

  return (
    /**
     * if you want to use image instead of svg uncomment following, and comment out <svg> element.
     *
     *
     */
    <h2
      style={{
        display: 'flex',
        alignItems: 'center',
        color: '#00512f',
        fontSize: '1.5rem',
        ...style
      }}
    >
      <img src={logo} alt="Berry" width={imgSize || '50'} />
      GreenZone
    </h2>
  );
};

export default Logo;
