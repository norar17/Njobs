import { GoogleLogin } from '@react-oauth/google';
import toast from 'react-hot-toast';
import { useAuth } from '../../context/AuthContext';

const GoogleSignInButton = ({ role, onSuccess }) => {
  const { googleLogin } = useAuth();
  const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID || '';

  if (!clientId) {
    return null;
  }

  const handleSuccess = async (credentialResponse) => {
    try {
      const data = await googleLogin(credentialResponse.credential, role);
      toast.success('Signed in with Google');
      onSuccess?.(data.user);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Google sign-in failed');
    }
  };

  return (
    <div className="flex justify-center">
      <GoogleLogin
        onSuccess={handleSuccess}
        onError={() => toast.error('Google sign-in failed')}
        theme="outline"
        shape="pill"
        width="320"
      />
    </div>
  );
};

export default GoogleSignInButton;
