import React, { useState } from 'react';
import {
  BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend,
  ResponsiveContainer, RadialBarChart, RadialBar, PieChart, Pie, Cell
} from 'recharts';
import {
  Activity, Upload, Download, Play, Pause, RotateCcw, GitBranch,
  TrendingUp, Eye, Settings, Users, Server, CheckCircle, Clock,
  AlertCircle, Database, Cpu, Network, Ship, Container, MonitorPlay
} from 'lucide-react';
import { motion } from 'framer-motion';

// 模拟数据
const performanceData = [
  { metric: 'mAP@50', local: 0.72, federated: 0.86 },
  { metric: 'Precision', local: 0.68, federated: 0.83 },
  { metric: 'Recall', local: 0.71, federated: 0.84 },
  { metric: 'F1-Score', local: 0.69, federated: 0.84 }
];

const trainingCurves = [
  { epoch: 1, localLoss: 2.5, federatedLoss: 2.3, localAccuracy: 0.45, federatedAccuracy: 0.52 },
  { epoch: 2, localLoss: 2.1, federatedLoss: 1.8, localAccuracy: 0.58, federatedAccuracy: 0.65 },
  { epoch: 3, localLoss: 1.8, federatedLoss: 1.5, localAccuracy: 0.68, federatedAccuracy: 0.75 },
  { epoch: 4, localLoss: 1.6, federatedLoss: 1.2, localAccuracy: 0.72, federatedAccuracy: 0.83 },
  { epoch: 5, localLoss: 1.4, federatedLoss: 1.0, localAccuracy: 0.75, federatedAccuracy: 0.86 }
];

const federatedTasks = [
  { id: 'FL_001', name: '集装箱检测模型v3.0', participants: 5, status: 'running', progress: 75, startTime: '2024-12-08 09:30', estimatedEnd: '2024-12-08 15:45' },
  { id: 'FL_002', name: '港机定位模型v2.1', participants: 3, status: 'completed', progress: 100, startTime: '2024-12-07 14:20', estimatedEnd: '2024-12-07 18:30' },
  { id: 'FL_003', name: '异常行为检测v1.5', participants: 4, status: 'pending', progress: 0, startTime: '2024-12-08 16:00', estimatedEnd: '2024-12-08 22:15' }
];

const modelVersions = [
  { version: 'v3.0-FL', type: 'Federated', mAP: 0.86, size: '245MB', created: '2024-12-08 14:30', participants: 5, status: 'active' },
  { version: 'v2.1-FL', type: 'Federated', mAP: 0.81, size: '238MB', created: '2024-12-07 18:30', participants: 3, status: 'archived' },
  { version: 'v3.0-Local', type: 'Local', mAP: 0.72, size: '201MB', created: '2024-12-08 11:15', participants: 1, status: 'backup' },
  { version: 'v2.0-Local', type: 'Local', mAP: 0.68, size: '195MB', created: '2024-12-06 16:45', participants: 1, status: 'archived' }
];

const participantNodes = [
  { id: 'node_1', name: '洋山深水港', location: '上海', models: 2, lastSync: '2分钟前', status: 'online' },
  { id: 'node_2', name: '盐田国际港', location: '深圳', models: 3, lastSync: '5分钟前', status: 'online' },
  { id: 'node_3', name: '青岛港', location: '青岛', models: 1, lastSync: '1小时前', status: 'offline' },
  { id: 'node_4', name: '天津港', location: '天津', models: 2, lastSync: '3分钟前', status: 'online' },
  { id: 'node_5', name: '宁波舟山港', location: '宁波', models: 2, lastSync: '7分钟前', status: 'syncing' }
];

export default function FederatedLearningDemo() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [selectedModel, setSelectedModel] = useState('v3.0-FL');
  const [showUploadModal, setShowUploadModal] = useState(false);

  const StatusBadge = ({ status }) => {
    const styles = {
      running: 'bg-blue-100 text-blue-800',
      completed: 'bg-green-100 text-green-800',
      pending: 'bg-yellow-100 text-yellow-800',
      online: 'bg-green-100 text-green-800',
      offline: 'bg-red-100 text-red-800',
      syncing: 'bg-blue-100 text-blue-800',
      active: 'bg-green-100 text-green-800',
      archived: 'bg-gray-100 text-gray-800',
      backup: 'bg-yellow-100 text-yellow-800'
    };

    return (
      <span className={`px-2 py-1 text-xs font-medium rounded-full ${styles[status]}`}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </span>
    );
  };

  const TabButton = ({ id, children, icon: Icon }) => (
    <button
      onClick={() => setActiveTab(id)}
      className={`flex items-center space-x-2 px-6 py-3 rounded-lg font-medium transition-all duration-200 ${
        activeTab === id
          ? 'bg-blue-600 text-white shadow-lg'
          : 'text-gray-600 hover:text-blue-600 hover:bg-blue-50'
      }`}
    >
      <Icon className="w-5 h-5" />
      <span>{children}</span>
    </button>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="flex items-center space-x-2">
                <Ship className="w-8 h-8 text-blue-600" />
                <h1 className="text-2xl font-bold text-gray-900">SmartPort Federation</h1>
              </div>
              <span className="text-sm text-gray-500">港口集装箱视觉AI联邦学习平台</span>
            </div>
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2 text-sm text-gray-600">
                <Network className="w-4 h-4" />
                <span>5个节点在线</span>
              </div>
              <div className="flex items-center space-x-2 text-sm text-gray-600">
                <Activity className="w-4 h-4" />
                <span>系统状态：正常</span>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Navigation */}
      <nav className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex space-x-2">
            <TabButton id="dashboard" icon={Activity}>仪表板</TabButton>
            <TabButton id="comparison" icon={TrendingUp}>模型对比</TabButton>
            <TabButton id="training" icon={Cpu}>联邦训练</TabButton>
            <TabButton id="models" icon={Database}>模型管理</TabButton>
            <TabButton id="nodes" icon={Network}>节点管理</TabButton>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-6 py-8">

        {/* Dashboard Tab */}
        {activeTab === 'dashboard' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
              {/* Key Metrics */}
              <div className="lg:col-span-2">
                <div className="bg-white rounded-xl shadow-sm p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-6">联邦学习效果概览</h3>
                  <div className="grid grid-cols-2 gap-6">
                    <div className="text-center">
                      <div className="text-3xl font-bold text-blue-600">86%</div>
                      <div className="text-sm text-gray-500">联邦模型mAP@50</div>
                      <div className="text-xs text-green-600 mt-1">↗ +19.4% vs 本地模型</div>
                    </div>
                    <div className="text-center">
                      <div className="text-3xl font-bold text-green-600">5</div>
                      <div className="text-sm text-gray-500">参与节点数</div>
                      <div className="text-xs text-blue-600 mt-1">覆盖5大港口</div>
                    </div>
                    <div className="text-center">
                      <div className="text-3xl font-bold text-purple-600">24h</div>
                      <div className="text-sm text-gray-500">平均训练时间</div>
                      <div className="text-xs text-green-600 mt-1">↗ -30% vs 传统方式</div>
                    </div>
                    <div className="text-center">
                      <div className="text-3xl font-bold text-orange-600">245MB</div>
                      <div className="text-sm text-gray-500">最新模型大小</div>
                      <div className="text-xs text-gray-600 mt-1">v3.0-FL</div>
                    </div>
                  </div>
                </div>
              </div>

              {/* System Status */}
              <div className="bg-white rounded-xl shadow-sm p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">系统状态</h3>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">活跃训练任务</span>
                    <span className="text-sm font-medium text-blue-600">1</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">在线节点</span>
                    <span className="text-sm font-medium text-green-600">4/5</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">模型版本</span>
                    <span className="text-sm font-medium text-purple-600">v3.0</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">上次同步</span>
                    <span className="text-sm font-medium text-gray-900">2分钟前</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Recent Activity */}
            <div className="bg-white rounded-xl shadow-sm p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-6">最近活动</h3>
              <div className="space-y-4">
                <div className="flex items-center space-x-3 p-4 bg-blue-50 rounded-lg">
                  <CheckCircle className="w-5 h-5 text-blue-600" />
                  <div>
                    <div className="text-sm font-medium text-gray-900">集装箱检测模型v3.0训练完成</div>
                    <div className="text-xs text-gray-500">5个节点参与，mAP@50提升至86%</div>
                  </div>
                  <div className="ml-auto text-xs text-gray-500">2小时前</div>
                </div>
                <div className="flex items-center space-x-3 p-4 bg-green-50 rounded-lg">
                  <Upload className="w-5 h-5 text-green-600" />
                  <div>
                    <div className="text-sm font-medium text-gray-900">洋山深水港上传新训练数据</div>
                    <div className="text-xs text-gray-500">包含1200张集装箱作业图像</div>
                  </div>
                  <div className="ml-auto text-xs text-gray-500">4小时前</div>
                </div>
                <div className="flex items-center space-x-3 p-4 bg-yellow-50 rounded-lg">
                  <Clock className="w-5 h-5 text-yellow-600" />
                  <div>
                    <div className="text-sm font-medium text-gray-900">青岛港节点离线</div>
                    <div className="text-xs text-gray-500">网络连接中断，正在重新连接</div>
                  </div>
                  <div className="ml-auto text-xs text-gray-500">1小时前</div>
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {/* Model Comparison Tab */}
        {activeTab === 'comparison' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
              {/* Performance Metrics */}
              <div className="bg-white rounded-xl shadow-sm p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-6">性能指标对比</h3>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={performanceData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="metric" />
                    <YAxis domain={[0, 1]} />
                    <Tooltip formatter={(value) => `${(value * 100).toFixed(1)}%`} />
                    <Legend />
                    <Bar dataKey="local" fill="#ef4444" name="本地模型" />
                    <Bar dataKey="federated" fill="#3b82f6" name="联邦模型" />
                  </BarChart>
                </ResponsiveContainer>
              </div>

              {/* Training Progress */}
              <div className="bg-white rounded-xl shadow-sm p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-6">训练过程对比</h3>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={trainingCurves}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="epoch" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Line type="monotone" dataKey="localAccuracy" stroke="#ef4444" name="本地准确率" />
                    <Line type="monotone" dataKey="federatedAccuracy" stroke="#3b82f6" name="联邦准确率" />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Detection Results */}
            <div className="bg-white rounded-xl shadow-sm p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-6">检测结果对比</h3>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-medium text-gray-900 mb-4">本地模型检测结果 (mAP: 72%)</h4>
                  <div className="bg-gray-100 rounded-lg h-64 flex items-center justify-center">
                    <div className="text-center">
                      <Container className="w-16 h-16 text-gray-400 mx-auto mb-2" />
                      <div className="text-sm text-gray-500">检测到 8/12 个集装箱</div>
                      <div className="text-xs text-red-600">误检: 2个, 漏检: 4个</div>
                    </div>
                  </div>
                </div>
                <div>
                  <h4 className="font-medium text-gray-900 mb-4">联邦模型检测结果 (mAP: 86%)</h4>
                  <div className="bg-gray-100 rounded-lg h-64 flex items-center justify-center">
                    <div className="text-center">
                      <Container className="w-16 h-16 text-green-500 mx-auto mb-2" />
                      <div className="text-sm text-gray-500">检测到 11/12 个集装箱</div>
                      <div className="text-xs text-green-600">误检: 0个, 漏检: 1个</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {/* Federated Training Tab */}
        {activeTab === 'training' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-gray-900">联邦训练任务</h2>
              <button
                onClick={() => setShowUploadModal(true)}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center space-x-2"
              >
                <Upload className="w-4 h-4" />
                <span>新建训练任务</span>
              </button>
            </div>

            <div className="bg-white rounded-xl shadow-sm overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">任务ID</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">模型名称</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">参与节点</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">状态</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">进度</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">操作</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {federatedTasks.map((task) => (
                      <tr key={task.id}>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-mono text-gray-900">{task.id}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{task.name}</td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center space-x-1">
                            <Users className="w-4 h-4 text-gray-400" />
                            <span className="text-sm text-gray-600">{task.participants}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <StatusBadge status={task.status} />
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <div
                              className={`h-2 rounded-full ${task.status === 'completed' ? 'bg-green-600' : 'bg-blue-600'}`}
                              style={{ width: `${task.progress}%` }}
                            ></div>
                          </div>
                          <span className="text-xs text-gray-500 mt-1">{task.progress}%</span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          <div className="flex items-center space-x-2">
                            {task.status === 'running' ? (
                              <button className="text-orange-600 hover:text-orange-800">
                                <Pause className="w-4 h-4" />
                              </button>
                            ) : (
                              <button className="text-green-600 hover:text-green-800">
                                <Play className="w-4 h-4" />
                              </button>
                            )}
                            <button className="text-blue-600 hover:text-blue-800">
                              <Eye className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </motion.div>
        )}

        {/* Model Management Tab */}
        {activeTab === 'models' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-gray-900">模型版本管理</h2>
              <div className="flex items-center space-x-2">
                <select
                  value={selectedModel}
                  onChange={(e) => setSelectedModel(e.target.value)}
                  className="border border-gray-300 rounded-lg px-3 py-2 text-sm"
                >
                  {modelVersions.map((model) => (
                    <option key={model.version} value={model.version}>
                      {model.version}
                    </option>
                  ))}
                </select>
                <button className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 flex items-center space-x-2">
                  <Download className="w-4 h-4" />
                  <span>部署模型</span>
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
              <div className="lg:col-span-2">
                <div className="bg-white rounded-xl shadow-sm overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">版本</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">类型</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">性能</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">大小</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">状态</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">操作</th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {modelVersions.map((model) => (
                          <tr key={model.version} className={selectedModel === model.version ? 'bg-blue-50' : ''}>
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{model.version}</td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                                model.type === 'Federated' ? 'bg-blue-100 text-blue-800' : 'bg-gray-100 text-gray-800'
                              }`}>
                                {model.type}
                              </span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                              mAP: {(model.mAP * 100).toFixed(1)}%
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{model.size}</td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <StatusBadge status={model.status} />
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              <div className="flex items-center space-x-2">
                                <button className="text-blue-600 hover:text-blue-800">
                                  <Download className="w-4 h-4" />
                                </button>
                                <button className="text-green-600 hover:text-green-800">
                                  <RotateCcw className="w-4 h-4" />
                                </button>
                                <button className="text-purple-600 hover:text-purple-800">
                                  <GitBranch className="w-4 h-4" />
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-xl shadow-sm p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">模型详情</h3>
                <div className="space-y-4">
                  <div>
                    <div className="text-sm text-gray-500">当前版本</div>
                    <div className="text-lg font-medium text-gray-900">{selectedModel}</div>
                  </div>
                  <div>
                    <div className="text-sm text-gray-500">模型性能</div>
                    <div className="text-lg font-medium text-blue-600">
                      {(modelVersions.find(m => m.version === selectedModel)?.mAP * 100 || 0).toFixed(1)}% mAP
                    </div>
                  </div>
                  <div>
                    <div className="text-sm text-gray-500">参与节点</div>
                    <div className="text-lg font-medium text-gray-900">
                      {modelVersions.find(m => m.version === selectedModel)?.participants || 0} 个
                    </div>
                  </div>
                  <div className="pt-4">
                    <button className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700">
                      设为生产模型
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {/* Node Management Tab */}
        {activeTab === 'nodes' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <h2 className="text-2xl font-bold text-gray-900 mb-6">节点管理</h2>
            <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
              {participantNodes.map((node) => (
                <div key={node.id} className="bg-white rounded-xl shadow-sm p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">{node.name}</h3>
                      <p className="text-sm text-gray-500">{node.location}</p>
                    </div>
                    <StatusBadge status={node.status} />
                  </div>

                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">模型数量</span>
                      <span className="text-sm font-medium text-gray-900">{node.models}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">上次同步</span>
                      <span className="text-sm font-medium text-gray-900">{node.lastSync}</span>
                    </div>
                  </div>

                  <div className="mt-6 flex items-center space-x-2">
                    <button className="flex-1 bg-blue-600 text-white py-2 px-3 rounded-lg hover:bg-blue-700 text-sm">
                      同步模型
                    </button>
                    <button className="p-2 text-gray-400 hover:text-gray-600">
                      <Settings className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </main>

      {/* Upload Modal */}
      {showUploadModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-white rounded-xl p-6 w-full max-w-md"
          >
            <h3 className="text-lg font-semibold text-gray-900 mb-4">创建新训练任务</h3>
            <form className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">任务名称</label>
                <input
                  type="text"
                  className="w-full border border-gray-300 rounded-lg px-3 py-2"
                  placeholder="例：集装箱检测模型v3.1"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">参与节点</label>
                <select className="w-full border border-gray-300 rounded-lg px-3 py-2">
                  <option>全部节点 (5个)</option>
                  <option>仅在线节点 (4个)</option>
                  <option>自定义选择</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">训练轮数</label>
                <input
                  type="number"
                  className="w-full border border-gray-300 rounded-lg px-3 py-2"
                  placeholder="5"
                  defaultValue="5"
                />
              </div>
              <div className="flex items-center space-x-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowUploadModal(false)}
                  className="flex-1 border border-gray-300 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-50"
                >
                  取消
                </button>
                <button
                  type="submit"
                  className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700"
                >
                  开始训练
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </div>
  );
}
