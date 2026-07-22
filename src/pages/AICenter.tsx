import { Bot, Brain, Code, TestTube, Loader2, AlertCircle, RefreshCw, Play } from 'lucide-react'
import { useModels, useEvaluateModel } from '../services/zbgym'
import { useState } from 'react'

export default function AICenter() {
  const { data: models, loading, error, refetch } = useModels()
  const { evaluate, loading: evaluating } = useEvaluateModel()
  const [evaluationResults, setEvaluationResults] = useState<Record<number, number>>({})

  const handleEvaluate = async (modelId: number) => {
    const result = await evaluate(modelId, 10)
    if (result) {
      setEvaluationResults(prev => ({ ...prev, [modelId]: result.mean_reward }))
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[var(--text-primary)]">AI Center</h1>
          <p className="text-[var(--text-secondary)] mt-1">Manage trained models</p>
        </div>
        <div className="flex items-center gap-4">
          <button onClick={() => refetch()} className="btn btn-secondary flex items-center gap-2">
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </button>
          <div className="px-4 py-2 rounded-xl bg-purple-500/20 border border-purple-500/30 flex items-center gap-2">
            <Bot className="w-4 h-4 text-purple-400" />
            <span className="text-sm font-medium text-purple-400">{models?.length || 0} Models</span>
          </div>
        </div>
      </div>

      {/* Error State */}
      {error && (
        <div className="card bg-red-500/10 border border-red-500/20 p-4">
          <div className="flex items-center gap-3">
            <AlertCircle className="w-5 h-5 text-red-400" />
            <p className="text-red-400">{error}</p>
          </div>
        </div>
      )}

      {/* AI Agents - Not available */}
      <div className="card opacity-60">
        <h3 className="text-lg font-semibold text-[var(--text-primary)] mb-4">AI Agents</h3>
        <p className="text-[var(--text-secondary)] text-center py-8">
          AI Agent monitoring requires additional backend endpoints. Currently showing trained models from the framework.
        </p>
      </div>

      {/* Models from Backend */}
      {loading ? (
        <div className="card flex items-center justify-center py-12">
          <Loader2 className="w-6 h-6 animate-spin text-purple-400 mr-3" />
          <span className="text-[var(--text-secondary)]">Loading models...</span>
        </div>
      ) : models && models.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {models.map((model) => (
            <div key={model.id} className="card group hover:scale-[1.02] transition-transform">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-500/30 to-blue-500/30 flex items-center justify-center">
                    <Brain className="w-6 h-6 text-purple-400" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-[var(--text-primary)]">{model.name}</h3>
                    <p className="text-xs text-[var(--text-secondary)]">{model.algorithm}</p>
                  </div>
                </div>
              </div>

              <div className="space-y-3 mb-4">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-[var(--text-secondary)]">Environment</span>
                  <span className="text-xs text-[var(--text-primary)]">{model.env_id}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-[var(--text-secondary)]">Created</span>
                  <span className="text-xs text-[var(--text-primary)]">{new Date(model.created_at).toLocaleDateString()}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-[var(--text-secondary)]">Model ID</span>
                  <span className="text-xs text-[var(--text-primary)]">#{model.id}</span>
                </div>
              </div>

              {evaluationResults[model.id] !== undefined && (
                <div className="p-3 rounded-lg bg-green-500/10 border border-green-500/20 mb-4">
                  <span className="text-xs text-green-400">Mean Reward: {evaluationResults[model.id].toFixed(3)}</span>
                </div>
              )}

              <button
                onClick={() => handleEvaluate(model.id)}
                disabled={evaluating}
                className="w-full btn btn-secondary flex items-center justify-center gap-2"
              >
                {evaluating ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Play className="w-4 h-4" />
                )}
                Evaluate
              </button>
            </div>
          ))}
        </div>
      ) : (
        <div className="card">
          <p className="text-[var(--text-secondary)] text-center py-12">
            No trained models available. Train a model first using the Trainer page.
          </p>
        </div>
      )}

      {/* Quick Actions */}
      <div className="card">
        <h3 className="text-lg font-semibold text-[var(--text-primary)] mb-4">Quick Actions</h3>
        <div className="flex flex-wrap gap-3">
          <button className="px-4 py-2 rounded-xl bg-purple-500/20 text-purple-400 hover:bg-purple-500/30 transition-colors flex items-center gap-2" disabled>
            <Brain className="w-4 h-4" />
            Train New Model
          </button>
          <button className="px-4 py-2 rounded-xl bg-white/10 text-[var(--text-secondary)] hover:bg-white/20 transition-colors flex items-center gap-2" disabled>
            <Code className="w-4 h-4" />
            Export Model
          </button>
          <button className="px-4 py-2 rounded-xl bg-white/10 text-[var(--text-secondary)] hover:bg-white/20 transition-colors flex items-center gap-2" disabled>
            <TestTube className="w-4 h-4" />
            Benchmark
          </button>
        </div>
      </div>
    </div>
  )
}
