import React, { useState } from 'react';
import { 
  X, 
  Github, 
  Cloud, 
  AlertCircle, 
  Copy, 
  Check, 
  ExternalLink,
  ShieldCheck,
  UserCheck,
  Sparkles
} from 'lucide-react';
import { useStudents } from '../context/StudentContext';
import firebaseConfig from '../../firebase-applet-config.json';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose }) => {
  const { loginWithGithub, loginWithGoogle, user } = useStudents();
  const [loadingProvider, setLoadingProvider] = useState<'github' | 'google' | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [showGithubSetupGuide, setShowGithubSetupGuide] = useState<boolean>(false);
  const [copiedCallback, setCopiedCallback] = useState(false);

  if (!isOpen) return null;

  const callbackUrl = `https://${firebaseConfig.authDomain}/__/auth/handler`;
  const firebaseConsoleUrl = `https://console.firebase.google.com/project/${firebaseConfig.projectId}/authentication/providers`;
  const githubDevSettingsUrl = 'https://github.com/settings/developers';

  const handleCopyCallback = () => {
    navigator.clipboard.writeText(callbackUrl);
    setCopiedCallback(true);
    setTimeout(() => setCopiedCallback(false), 2500);
  };

  const handleGithubLogin = async () => {
    setLoadingProvider('github');
    setErrorMessage(null);
    setShowGithubSetupGuide(false);
    try {
      const loggedUser = await loginWithGithub();
      if (loggedUser) {
        onClose();
      }
    } catch (err: any) {
      console.error('GitHub Auth error:', err);
      if (
        err.code === 'auth/operation-not-allowed' || 
        err.code === 'auth/configuration-not-found' ||
        err.message?.toLowerCase().includes('configuration') ||
        err.message?.toLowerCase().includes('disabled')
      ) {
        setErrorMessage('ยังไม่ได้เปิดใช้งาน GitHub Sign-in Provider ใน Firebase Console');
        setShowGithubSetupGuide(true);
      } else if (err.code === 'auth/account-exists-with-different-credential') {
        setErrorMessage('อีเมลของบัญชี GitHub นี้เชื่อมต่อกับวิธีเข้าสู่ระบบอื่นแล้ว (เช่น Google)');
      } else if (err.code === 'auth/popup-blocked') {
        setErrorMessage('เบราว์เซอร์บล็อกหน้าต่างป๊อปอัป กรุณาอนุญาตป๊อปอัปสำหรับหน้านี้แล้วลองใหม่อีกครั้ง');
      } else {
        setErrorMessage(err.message || 'เกิดข้อผิดพลาดในการเข้าสู่ระบบด้วย GitHub');
      }
    } finally {
      setLoadingProvider(null);
    }
  };

  const handleGoogleLogin = async () => {
    setLoadingProvider('google');
    setErrorMessage(null);
    try {
      const loggedUser = await loginWithGoogle();
      if (loggedUser) {
        onClose();
      }
    } catch (err: any) {
      console.error('Google Auth error:', err);
      setErrorMessage(err.message || 'เกิดข้อผิดพลาดในการเข้าสู่ระบบด้วย Google');
    } finally {
      setLoadingProvider(null);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fade-in">
      <div className="bg-white rounded-3xl max-w-md w-full p-6 sm:p-7 shadow-2xl border border-slate-100 space-y-5 max-h-[90vh] overflow-y-auto">
        
        {/* Header */}
        <div className="flex items-start justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-2xl bg-purple-100 text-purple-600 flex items-center justify-center shadow-xs">
              <Cloud className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-black text-slate-800 font-heading">
                เข้าสู่ระบบ (Sign In)
              </h3>
              <p className="text-xs text-slate-400">
                ซิงค์ข้อมูลนักเรียน & คะแนนดาวขึ้นระบบคลาวด์
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* User state if already logged in */}
        {user ? (
          <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-center space-y-2">
            <div className="w-12 h-12 mx-auto rounded-full overflow-hidden border-2 border-emerald-400">
              {user.photoURL ? (
                <img src={user.photoURL} alt="avatar" className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full bg-emerald-600 text-white flex items-center justify-center font-bold">
                  {user.email?.[0]?.toUpperCase() || 'U'}
                </div>
              )}
            </div>
            <div className="text-sm font-bold text-emerald-900">
              เข้าสู่ระบบอยู่แล้ว: {user.displayName || user.email}
            </div>
            <p className="text-xs text-emerald-700">ข้อมูลของคุณกำลังซิงค์อัตโนมัติ</p>
          </div>
        ) : (
          /* Login Buttons */
          <div className="space-y-3">
            {/* Google / Gmail Login Button */}
            <button
              onClick={handleGoogleLogin}
              disabled={loadingProvider !== null}
              className="w-full p-3.5 bg-white hover:bg-slate-50 border-2 border-purple-200 hover:border-purple-400 active:scale-98 text-slate-700 rounded-2xl font-bold text-sm shadow-sm transition-all flex items-center justify-between cursor-pointer disabled:opacity-50"
            >
              <div className="flex items-center space-x-3">
                <svg className="w-6 h-6 shrink-0" viewBox="0 0 24 24">
                  <path
                    fill="#4285F4"
                    d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.665-5.17 3.665-9.17z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.15C3.26 21.36 7.34 24 12 24z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.25C.45 8.18 0 10.02 0 12s.45 3.82 1.25 5.42l4.03-3.15z"
                  />
                  <path
                    fill="#EA4335"
                    d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.34 0 3.26 2.64 1.25 6.58l4.03 3.15c.95-2.83 3.6-4.98 6.72-4.98z"
                  />
                </svg>
                <div className="text-left">
                  <div className="leading-tight font-black text-slate-800 text-sm">เข้าสู่ระบบด้วย Google (Gmail)</div>
                  <div className="text-[10px] text-slate-500 font-normal">ล็อกอินด้วยบัญชี Gmail สะดวกและรวดเร็ว</div>
                </div>
              </div>
              {loadingProvider === 'google' ? (
                <span className="text-xs text-purple-600 font-bold animate-pulse">กำลังเชื่อมต่อ...</span>
              ) : (
                <span className="text-xs bg-purple-100 text-purple-700 font-black px-2 py-0.5 rounded-lg">แนะนำ</span>
              )}
            </button>

            {/* GitHub Login Button */}
            <button
              onClick={handleGithubLogin}
              disabled={loadingProvider !== null}
              className="w-full p-3.5 bg-[#24292e] hover:bg-[#1b1f23] active:scale-98 text-white rounded-2xl font-bold text-sm shadow-xs transition-all flex items-center justify-between cursor-pointer disabled:opacity-50"
            >
              <div className="flex items-center space-x-3">
                <Github className="w-5 h-5 fill-white shrink-0" />
                <div className="text-left">
                  <div className="leading-tight font-bold">เข้าสู่ระบบด้วย GitHub</div>
                  <div className="text-[10px] text-slate-300 font-normal">Sign in with GitHub account</div>
                </div>
              </div>
              {loadingProvider === 'github' ? (
                <span className="text-xs text-slate-300 animate-pulse">กำลังเชื่อมต่อ...</span>
              ) : (
                <span className="text-xs bg-white/10 px-2 py-0.5 rounded-lg text-slate-200">ทางเลือก</span>
              )}
            </button>
          </div>
        )}

        {/* Error message */}
        {errorMessage && (
          <div className="p-3.5 rounded-2xl bg-rose-50 border border-rose-200 text-xs font-semibold text-rose-700 flex items-start space-x-2">
            <AlertCircle className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />
            <div className="flex-1">{errorMessage}</div>
          </div>
        )}

        {/* GitHub Setup Guide (Shows if provider is disabled in Firebase Console) */}
        {showGithubSetupGuide && (
          <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 text-slate-800 space-y-3 animate-fade-in text-xs">
            <div className="flex items-center space-x-2 text-amber-800 font-bold">
              <ShieldCheck className="w-4 h-4 text-amber-600" />
              <span>วิธีเปิดใช้งาน GitHub ใน Firebase Console:</span>
            </div>
            
            <ol className="list-decimal list-inside space-y-2 text-[11px] text-slate-700 leading-relaxed">
              <li>
                ไปที่{' '}
                <a 
                  href={firebaseConsoleUrl} 
                  target="_blank" 
                  rel="noreferrer"
                  className="font-bold text-purple-700 hover:underline inline-flex items-center gap-0.5"
                >
                  Firebase Authentication Providers <ExternalLink className="w-3 h-3" />
                </a>{' '}
                แล้วเลือก <strong>"Add new provider" &gt; "GitHub"</strong>
              </li>
              <li>
                ไปที่{' '}
                <a 
                  href={githubDevSettingsUrl} 
                  target="_blank" 
                  rel="noreferrer"
                  className="font-bold text-purple-700 hover:underline inline-flex items-center gap-0.5"
                >
                  GitHub Developer Settings <ExternalLink className="w-3 h-3" />
                </a>{' '}
                กด <strong>New OAuth App</strong>
              </li>
              <li>
                วาง <strong>Authorization callback URL</strong> นี้ใน GitHub:
                <div className="mt-1 flex items-center space-x-1.5">
                  <input 
                    readOnly 
                    value={callbackUrl} 
                    className="flex-1 px-2.5 py-1.5 bg-white border border-amber-300 rounded-lg text-[10px] font-mono text-slate-700 select-all"
                  />
                  <button
                    onClick={handleCopyCallback}
                    className="px-2.5 py-1.5 bg-amber-500 hover:bg-amber-600 text-white rounded-lg text-[10px] font-bold flex items-center space-x-1 cursor-pointer transition-colors"
                  >
                    {copiedCallback ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                    <span>{copiedCallback ? 'ก๊อปแล้ว' : 'คัดลอก'}</span>
                  </button>
                </div>
              </li>
              <li>
                คัดลอก <strong>Client ID</strong> และ <strong>Client Secret</strong> จาก GitHub มาใส่ใน Firebase Console แล้วกด <strong>Save</strong>
              </li>
            </ol>
            <p className="text-[10px] text-amber-800 font-medium">
              💡 เมื่อเปิดใช้งานเสร็จแล้ว สามารถกลับมากดปุ่ม "เข้าสู่ระบบด้วย GitHub" ได้ทันทีครับ
            </p>
          </div>
        )}

        {/* Feature summary */}
        <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-2">
          <div className="text-[11px] font-bold text-slate-600 flex items-center space-x-1.5">
            <Sparkles className="w-3.5 h-3.5 text-purple-600" />
            <span>ประโยชน์ของการเข้าสู่ระบบ:</span>
          </div>
          <ul className="text-[11px] text-slate-500 space-y-1">
            <li className="flex items-center space-x-1.5">
              <span className="text-purple-600 font-bold">•</span>
              <span>ข้อมูลไม่หาย แม้จะล้างแคชหรือเปลี่ยนเบราว์เซอร์</span>
            </li>
            <li className="flex items-center space-x-1.5">
              <span className="text-purple-600 font-bold">•</span>
              <span>เปิดใช้งานพร้อมกันได้หลายเครื่อง (ครูประจำชั้น & ครูผู้ช่วย)</span>
            </li>
            <li className="flex items-center space-x-1.5">
              <span className="text-purple-600 font-bold">•</span>
              <span>ซิงค์ขึ้นระบบคลาวด์อัตโนมัติแบบเรียลไทม์</span>
            </li>
          </ul>
        </div>

        {/* Footer */}
        <div className="flex justify-end pt-2">
          <button
            onClick={onClose}
            className="px-5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl transition-colors cursor-pointer"
          >
            ปิดหน้าต่าง
          </button>
        </div>

      </div>
    </div>
  );
};
