import { useState } from 'react';
import toast from 'react-hot-toast';
import { CheckCircle2, ShieldCheck, Loader2 } from 'lucide-react';
import PhoneInput from './PhoneInput';
import { userService } from '../../services/userService';

const PhoneVerificationField = ({ savedPhone, onVerified }) => {
  const [draftPhone, setDraftPhone] = useState(savedPhone || '');
  const [stage, setStage] = useState('idle');
  const [sending, setSending] = useState(false);
  const [confirming, setConfirming] = useState(false);
  const [code, setCode] = useState('');

  const isDirty = draftPhone !== (savedPhone || '');

  const handleSendCode = async () => {
    if (!draftPhone) {
      toast.error('Enter a phone number first');
      return;
    }
    setSending(true);
    try {
      await userService.sendPhoneVerification(draftPhone);
      toast.success('Code sent — check your phone');
      setStage('verifying');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to send verification code');
    } finally {
      setSending(false);
    }
  };

  const handleConfirmCode = async () => {
    if (!/^\d{6}$/.test(code)) {
      toast.error('Enter the 6-digit code');
      return;
    }
    setConfirming(true);
    try {
      const res = await userService.confirmPhoneVerification(draftPhone, code);
      toast.success('Phone number verified');
      setStage('idle');
      setCode('');
      onVerified?.(res.user);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to verify code');
    } finally {
      setConfirming(false);
    }
  };

  return (
    <div>
      <label className="label-field">Phone number</label>

      {savedPhone && !isDirty && stage === 'idle' ? (
        <div className="flex items-center gap-2.5 rounded-xl border border-status-accepted/30 bg-status-accepted/5 px-3.5 py-2.5">
          <CheckCircle2 className="h-4 w-4 flex-shrink-0 text-status-accepted" />
          <span className="flex-1 text-sm text-ink dark:text-paper-100">{savedPhone}</span>
          <span className="text-xs font-medium text-status-accepted">Verified</span>
        </div>
      ) : (
        <PhoneInput value={draftPhone} onChange={setDraftPhone} />
      )}

      {(isDirty || (!savedPhone && draftPhone)) && stage === 'idle' && (
        <button
          type="button"
          onClick={handleSendCode}
          disabled={sending}
          className="btn-secondary mt-2.5 text-xs"
        >
          {sending ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <ShieldCheck className="h-3.5 w-3.5" />}
          {sending ? 'Sending…' : 'Send verification code'}
        </button>
      )}

      {stage === 'verifying' && (
        <div className="mt-3 rounded-xl border border-brand/20 bg-brand/5 p-3.5">
          <p className="mb-2 text-xs text-ink-700 dark:text-paper-100">
            Enter the 6-digit code sent to <strong>{draftPhone}</strong>
          </p>
          <div className="flex gap-2">
            <input
              type="text"
              inputMode="numeric"
              maxLength={6}
              value={code}
              onChange={(e) => setCode(e.target.value.replace(/[^0-9]/g, ''))}
              placeholder="000000"
              className="input-field flex-1 text-center tracking-[0.3em]"
            />
            <button type="button" onClick={handleConfirmCode} disabled={confirming} className="btn-primary text-xs">
              {confirming ? 'Verifying…' : 'Confirm'}
            </button>
          </div>
          <button
            type="button"
            onClick={() => { setStage('idle'); setCode(''); }}
            className="mt-2 text-xs text-ink-400 hover:text-ink-600 dark:text-ink-300"
          >
            Cancel
          </button>
        </div>
      )}

      <p className="mt-1.5 text-xs text-ink-400 dark:text-ink-300">
        Used for SMS password resets. We verify it's really yours before saving it.
      </p>
    </div>
  );
};

export default PhoneVerificationField;
