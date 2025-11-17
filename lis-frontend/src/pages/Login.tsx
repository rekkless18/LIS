import React, { useState } from 'react';
import { User, Lock, Eye, EyeOff } from 'lucide-react';
import { useAuthStore } from '@/stores/auth';
import { useNavigate } from 'react-router-dom';

interface LoginFormData {
  username: string;
  password: string;
}

interface LoginProps {
  onLogin?: (data: LoginFormData) => void;
}

const Login: React.FC<LoginProps> = ({ onLogin }) => {
  const [formData, setFormData] = useState<LoginFormData>({
    username: '',
    password: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState<{ username?: string; password?: string }>({});
  
  const { login, loading } = useAuthStore();
  const navigate = useNavigate();

  const validateForm = (): boolean => {
    const newErrors: { username?: string; password?: string } = {};

    if (!formData.username.trim()) {
      newErrors.username = '用户名不能为空';
    } else if (formData.username.length < 3 || formData.username.length > 20) {
      newErrors.username = '用户名长度必须在3-20个字符之间';
    } else if (!/^[a-zA-Z0-9_]+$/.test(formData.username)) {
      newErrors.username = '用户名只能包含字母、数字和下划线';
    }

    if (!formData.password) {
      newErrors.password = '密码不能为空';
    } else if (formData.password.length < 6 || formData.password.length > 20) {
      newErrors.password = '密码长度必须在6-20个字符之间';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (field: keyof LoginFormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // 清除对应字段的错误信息
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: undefined }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    try {
      await login(formData.username, formData.password)
      if (onLogin) {
        onLogin(formData)
      }
      navigate('/home')
    } catch (error) {
      console.error('登录失败:', error);
      alert('登录失败，请检查用户名和密码');
    }
  };

  const handleForgotPassword = () => {
    alert('该功能还在完善中，请稍候再来');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 via-blue-700 to-blue-400 flex items-center justify-center relative overflow-hidden">
      {/* 背景装饰 */}
      <div className="absolute inset-0 bg-gradient-to-r from-blue-800/20 to-blue-600/20"></div>
      <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_30%_20%,rgba(255,255,255,0.1),transparent_50%)]"></div>
      <div className="absolute bottom-0 right-0 w-full h-full bg-[radial-gradient(circle_at_70%_80%,rgba(255,255,255,0.1),transparent_50%)]"></div>
      
      <div className="relative z-10 w-full max-w-4xl mx-auto px-4">
        <div className="bg-white/95 backdrop-blur-sm rounded-2xl shadow-2xl overflow-hidden">
          <div className="flex min-h-[500px]">
            {/* Logo区域 - 左侧 */}
            <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-blue-600 to-blue-800 items-center justify-center p-8">
              <div className="text-center text-white">
                <div className="mb-6">
                  <div className="w-20 h-20 mx-auto bg-white/20 rounded-full flex items-center justify-center mb-4">
                    <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center">
                      <div className="w-6 h-6 bg-blue-600 rounded-full animate-pulse"></div>
                    </div>
                  </div>
                </div>
                <h1 className="text-3xl font-bold mb-2">智惠实验室系统</h1>
                <p className="text-blue-100 text-lg">Laboratory Information System</p>
                <div className="mt-8 text-sm text-blue-200">
                  <p>高效 · 智能 · 安全</p>
                </div>
              </div>
            </div>

            {/* 登录表单区域 - 右侧 */}
            <div className="w-full lg:w-1/2 p-8 lg:p-12">
              <div className="max-w-sm mx-auto">
                {/* 移动端Logo */}
                <div className="lg:hidden text-center mb-8">
                  <div className="w-16 h-16 mx-auto bg-blue-600 rounded-full flex items-center justify-center mb-4">
                    <div className="w-8 h-8 bg-white rounded-full flex items-center justify-center">
                      <div className="w-4 h-4 bg-blue-600 rounded-full"></div>
                    </div>
                  </div>
                  <h2 className="text-2xl font-bold text-gray-800">智惠实验室系统</h2>
                  <p className="text-gray-600 text-sm mt-1">用户登录</p>
                </div>

                {/* 桌面版标题 */}
                <div className="hidden lg:block mb-8">
                  <h2 className="text-2xl font-bold text-gray-800 mb-2">欢迎登录</h2>
                  <p className="text-gray-600">请输入您的账户信息</p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                  {/* 用户名输入框 */}
                  <div>
                    <label htmlFor="username" className="block text-sm font-medium text-gray-700 mb-2">
                      用户名
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <User className="h-5 w-5 text-gray-400" />
                      </div>
                      <input
                        id="username"
                        type="text"
                        value={formData.username}
                        onChange={(e) => handleInputChange('username', e.target.value)}
                        placeholder="请输入用户名"
                        className={`block w-full pl-10 pr-3 py-3 border rounded-lg shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors ${
                          errors.username ? 'border-red-300' : 'border-gray-300'
                        }`}
                        disabled={loading}
                      />
                    </div>
                    {errors.username && (
                      <p className="mt-1 text-sm text-red-600">{errors.username}</p>
                    )}
                  </div>

                  {/* 密码输入框 */}
                  <div>
                    <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                      密码
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Lock className="h-5 w-5 text-gray-400" />
                      </div>
                      <input
                        id="password"
                        type={showPassword ? 'text' : 'password'}
                        value={formData.password}
                        onChange={(e) => handleInputChange('password', e.target.value)}
                        placeholder="请输入密码"
                        className={`block w-full pl-10 pr-10 py-3 border rounded-lg shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors ${
                          errors.password ? 'border-red-300' : 'border-gray-300'
                        }`}
                        disabled={loading}
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600 transition-colors"
                      >
                        {showPassword ? (
                          <EyeOff className="h-5 w-5" />
                        ) : (
                          <Eye className="h-5 w-5" />
                        )}
                      </button>
                    </div>
                    {errors.password && (
                      <p className="mt-1 text-sm text-red-600">{errors.password}</p>
                    )}
                  </div>

                  {/* 登录按钮 */}
                  <button
                    type="submit"
                    disabled={loading}
                    className={`w-full py-3 px-4 rounded-lg font-medium text-white transition-colors ${
                      loading
                        ? 'bg-gray-400 cursor-not-allowed'
                        : 'bg-blue-600 hover:bg-blue-700 active:bg-blue-800'
                    }`}
                  >
                    {loading ? (
                      <div className="flex items-center justify-center">
                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                        登录中...
                      </div>
                    ) : (
                      '登录 / Login'
                    )}
                  </button>

                  {/* 忘记密码 */}
                  <div className="text-right">
                    <button
                      type="button"
                      onClick={handleForgotPassword}
                      className="text-sm text-blue-600 hover:text-blue-800 hover:underline transition-colors"
                    >
                      忘记密码？
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>

        {/* 底部信息 */}
        <div className="text-center mt-8 text-white/80 text-sm">
          <p className="mb-1">© 2025 智惠实验室系统 版权所有</p>
          <p className="mb-1">7*24技术支持：131-4785-5476</p>
          <p className="text-white/60 text-xs">v0.0.1</p>
        </div>
      </div>
    </div>
  );
};

export default Login;