/*!
  NeuroOrchestrator.js - Enhanced Version with Advanced Features
  ------------------------------------------------------------
  
  🚀 NEW FEATURES ADDED:
  
  1. AGENT PAUSE/RESUME
     - Control long-running tasks with pause() and resume() methods
     - Automatic task queuing when paused
     - Event-driven pause/resume notifications
     - Queue management and status monitoring
  
  2. QUICK VALIDATION
     - Built-in validators for common output types
     - validateOutput(value, type) - supports 'email', 'url', 'json'
     - validateEmail(), validateURL(), validateJSON() - convenience methods
     - validateMultipleOutputs() - batch validation
     - Detailed validation results with error information
  
  3. BATCH PROCESSING
     - Process multiple similar tasks efficiently
     - Automatic task batching and concurrency control
     - Retry mechanism for failed tasks
     - Progress tracking and monitoring
     - Pause/resume support during batch processing
     - processBatch(tasks, options) method
  
  4. STREAMING RESPONSES
     - Real-time output streaming for long responses
     - Configurable chunk size and delay
     - Buffer management and progress tracking
     - Custom onStream callback for real-time updates
     - streamResponse(input, context, options) method
  
  🛠️ ENHANCED FEATURES:
  - Fixed memory leaks with bounds and TTL
  - Added comprehensive error handling
  - Fixed animation cleanup issues
  - Enhanced security with input sanitization
  - Added event emitter for state monitoring
  - Improved UI with accessibility
  - Added configuration validation
  - Better vision API with fallbacks
  - Performance monitoring and optimization
  - Developer tools and debugging support
  
  📖 USAGE:
    1. Include this file in your HTML or import in JS
    2. Initialize: const orchestrator = new NeuroOrchestrator(container, options)
    3. Run: orchestrator.orchestrate("Your input").then(res => console.log(res))
    4. Use new features:
       - orchestrator.pause() / resume()
       - orchestrator.validateEmail('test@example.com')
       - orchestrator.processBatch(tasks)
       - orchestrator.streamResponse('long input', {}, {onStream: callback})
    5. Listen to events: orchestrator.on('stateChange', (state) => console.log(state))
  
  🎯 KEY METHODS:
  
  // Basic orchestration
  orchestrator.orchestrate(input, context)
  
  // Pause/Resume
  orchestrator.pause()
  orchestrator.resume()
  orchestrator.isPaused()
  orchestrator.getPauseStatus()
  
  // Validation
  orchestrator.validateEmail(email)
  orchestrator.validateURL(url)
  orchestrator.validateJSON(jsonString)
  orchestrator.validateOutput(value, type)
  orchestrator.validateMultipleOutputs(outputs)
  
  // Batch Processing
  orchestrator.processBatch(tasks, options)
  orchestrator.getBatchStatus()
  orchestrator.cancelBatch()
  
  // Streaming
  orchestrator.streamResponse(input, context, options)
  orchestrator.getStreamStatus()
  orchestrator.cancelStream()
  
  // Memory Management
  orchestrator.getMemory()
  orchestrator.getStats()
  orchestrator.clearMemory(type)
  orchestrator.setMemory(key, value)
  
  // Developer Tools
  orchestrator.enableDebug(options)
  orchestrator.getDebugInfo()
  orchestrator.exportDebugData()
  orchestrator.runHealthCheck()
  
  📋 EVENTS:
  
  // Basic events
  'init', 'stateChange', 'complete', 'error', 'destroyed'
  
  // Pause/Resume events
  'agentPaused', 'agentResumed', 'taskQueued'
  
  // Batch processing events
  'batchStarted', 'batchCompleted', 'batchFailed', 'batchCancelled'
  
  // Streaming events
  'streamStarted', 'streamChunk', 'streamCompleted', 'streamFailed', 'streamCancelled'
  
  // Vision events
  'visionRequested', 'visionCaptured', 'visionFailed'
  
  // Memory events
  'memoryCleared', 'memoryUpdated', 'memoryUpdateFailed'
  
  // Clarification events
  'clarification', 'clarificationTimeout'
  
  // Developer events
  'debugEnabled', 'debugDisabled', 'performanceMonitoringStarted', 'performanceMonitoringStopped'
  
  🔧 CONFIGURATION:
  
  const options = {
    // Basic configuration
    autoInit: true,
    enableAnimations: true,
    enableVision: true,
    enableDebug: false,
    
    // Memory configuration
    memoryConfig: {
      maxShort: 100,
      maxLong: 1000,
      shortTTL: 3600000,  // 1 hour
      longTTL: 86400000   // 24 hours
    },
    
    // Safety configuration
    safetyConfig: {
      maxInputLength: 10000,
      maxWords: 1000
    },
    
    // Batch processing configuration
    batchConfig: {
      batchSize: 5,
      concurrency: 3,
      retryAttempts: 2,
      delayBetweenBatches: 1000
    },
    
    // Streaming configuration
    streamingConfig: {
      chunkSize: 100,
      delay: 50,
      enableBuffering: true,
      bufferSize: 500
    },
    
    // UI configuration
    uiConfig: {
      className: 'neuro-container',
      animationInterval: 400,
      maxDots: 4
    }
  };
  
  🌐 BROWSER COMPATIBILITY:
  - Chrome 80+
  - Firefox 75+
  - Safari 13+
  - Edge 80+
  
  📦 EXPORTS:
  - NeuroOrchestrator (main class)
  - MemoryManager, SafetyEngine, BrainRules, UIManager, VisionEngine
  - EventEmitter, NeuroError, SecurityError, ValidationError
  - PerformanceCache, PerformanceMonitor, DeveloperTools
  - AgentController, QuickValidator, BatchProcessor, StreamingResponse, Semaphore
  
  COPYRIGHT:
    All rights reserved.
    You may use this code for personal purposes only.
*/

// ----------------- ERROR CLASSES -----------------
class NeuroError extends Error {
  constructor(message, code, originalError = null) {
    super(message);
    this.name = 'NeuroError';
    this.code = code;
    this.originalError = originalError;
  }
}

class SecurityError extends NeuroError {
  constructor(message, code = 'SECURITY_VIOLATION') {
    super(message, code);
    this.name = 'SecurityError';
  }
}

class ValidationError extends NeuroError {
  constructor(message, code = 'VALIDATION_FAILED') {
    super(message, code);
    this.name = 'ValidationError';
  }
}

// ----------------- EVENT EMITTER -----------------
// Lightweight logger to control debug output (disabled by default)
class Logger {
  static enabled = false;

  static debug(...args) {
    if (Logger.enabled) {
      console.debug('[Neuro] ', ...args);
    }
  }

  static log(...args) {
    if (Logger.enabled) console.log('[Neuro] ', ...args);
  }

  static warn(...args) {
    if (Logger.enabled) console.warn('[Neuro] ', ...args);
  }

  static error(...args) {
    console.error('[Neuro] ', ...args);
  }
}

class EventEmitter {
  constructor() {
    this.events = {};
    Logger.debug('[EventEmitter] Initialized');
  }

  on(event, listener) {
    if (!this.events[event]) this.events[event] = [];
    this.events[event].push(listener);
    Logger.debug(`[EventEmitter] Listener added for event: ${event}`);
    return () => this.off(event, listener);
  }

  off(event, listener) {
    if (!this.events[event]) return;
    this.events[event] = this.events[event].filter(l => l !== listener);
    Logger.debug(`[EventEmitter] Listener removed for event: ${event}`);
  }

  emit(event, data) {
    if (!this.events[event]) {
      Logger.debug(`[EventEmitter] No listeners for event: ${event}`);
      return;
    }
    Logger.debug(`[EventEmitter] Emitting event: ${event}`);
    this.events[event].forEach(listener => {
      try {
        listener(data);
      } catch (e) {
        Logger.error(`Event listener error for ${event}:`, e);
      }
    });
  }

  removeAllListeners(event) {
    if (event) {
      delete this.events[event];
      Logger.debug(`[EventEmitter] All listeners removed for event: ${event}`);
    } else {
      this.events = {};
      Logger.debug('[EventEmitter] All listeners removed');
    }
  }
}

// ----------------- PERFORMANCE CACHE -----------------
class PerformanceCache {
  constructor(maxSize = 1000, ttl = 300000) { // 5 minutes default TTL
    this.cache = new Map();
    this.maxSize = maxSize;
    this.ttl = ttl;
    this.hits = 0;
    this.misses = 0;
    this.sets = 0;
  }

  set(key, value) {
    // Clean up expired entries if cache is full
    if (this.cache.size >= this.maxSize) {
      this._cleanupExpired();
    }
    
    this.cache.set(key, {
      value,
      timestamp: Date.now(),
      accessCount: 0
    });
    
    this.sets++;
    return this;
  }

  get(key) {
    const entry = this.cache.get(key);
    
    if (!entry) {
      this.misses++;
      return undefined;
    }
    
    // Check TTL
    if (Date.now() - entry.timestamp > this.ttl) {
      this.cache.delete(key);
      this.misses++;
      return undefined;
    }
    
    // Update access count and timestamp
    entry.accessCount++;
    entry.timestamp = Date.now();
    
    this.hits++;
    return entry.value;
  }

  has(key) {
    const entry = this.cache.get(key);
    if (!entry) return false;
    
    if (Date.now() - entry.timestamp > this.ttl) {
      this.cache.delete(key);
      return false;
    }
    
    return true;
  }

  delete(key) {
    return this.cache.delete(key);
  }

  clear() {
    this.cache.clear();
    this.hits = 0;
    this.misses = 0;
    this.sets = 0;
  }

  _cleanupExpired() {
    const now = Date.now();
    for (const [key, entry] of this.cache.entries()) {
      if (now - entry.timestamp > this.ttl) {
        this.cache.delete(key);
      }
    }
  }

  getStats() {
    const totalRequests = this.hits + this.misses;
    const hitRate = totalRequests > 0 ? (this.hits / totalRequests) * 100 : 0;
    
    return {
      size: this.cache.size,
      maxSize: this.maxSize,
      hits: this.hits,
      misses: this.misses,
      sets: this.sets,
      hitRate: hitRate.toFixed(2) + '%',
      utilization: `${((this.cache.size / this.maxSize) * 100).toFixed(1)}%`
    };
  }

  getMostAccessed(limit = 10) {
    return Array.from(this.cache.entries())
      .map(([key, entry]) => ({
        key,
        value: entry.value,
        accessCount: entry.accessCount,
        age: Date.now() - entry.timestamp
      }))
      .sort((a, b) => b.accessCount - a.accessCount)
      .slice(0, limit);
  }
}

// ----------------- PERFORMANCE MONITOR -----------------
class PerformanceMonitor {
  constructor() {
    this.metrics = new Map();
    this.timers = new Map();
    this.counters = new Map();
  }

  startTimer(name) {
    this.timers.set(name, performance.now());
  }

  endTimer(name) {
    const startTime = this.timers.get(name);
    if (!startTime) return null;
    
    const duration = performance.now() - startTime;
    this.timers.delete(name);
    
    if (!this.metrics.has(name)) {
      this.metrics.set(name, {
        total: 0,
        count: 0,
        min: Infinity,
        max: 0,
        avg: 0
      });
    }
    
    const metric = this.metrics.get(name);
    metric.total += duration;
    metric.count++;
    metric.min = Math.min(metric.min, duration);
    metric.max = Math.max(metric.max, duration);
    metric.avg = metric.total / metric.count;
    
    return duration;
  }

  incrementCounter(name, value = 1) {
    const current = this.counters.get(name) || 0;
    this.counters.set(name, current + value);
  }

  getMetrics() {
    const result = {
      timers: Object.fromEntries(this.metrics),
      counters: Object.fromEntries(this.counters),
      memory: this._getMemoryUsage()
    };
    
    return result;
  }

  _getMemoryUsage() {
    if (performance.memory) {
      return {
        used: Math.round(performance.memory.usedJSHeapSize / 1048576), // MB
        total: Math.round(performance.memory.totalJSHeapSize / 1048576), // MB
        limit: Math.round(performance.memory.jsHeapSizeLimit / 1048576) // MB
      };
    }
    return null;
  }

  reset() {
    this.metrics.clear();
    this.timers.clear();
    this.counters.clear();
  }

  exportMetrics() {
    return {
      timestamp: Date.now(),
      metrics: this.getMetrics()
    };
  }
}

// ----------------- MEMORY MANAGER -----------------
class MemoryManager {
  constructor(config = {}) {
    Logger.debug('[MemoryManager] Initializing with config (redacted)');
    this.config = {
      maxShort: 100,
      maxLong: 1000,
      shortTTL: 3600000, // 1 hour
      longTTL: 86400000, // 24 hours
      enableCache: true,
      cacheSize: 500,
      cacheTTL: 300000, // 5 minutes
      enableCompression: true,
      enableOptimization: true,
      ...config
    };
    
    this.short = [];
    this.long = [];
    this.user = new Map();
    this.context = new Map(); // New: Advanced context management
    this.conversations = new Map(); // New: Session memory
    this.preferences = new Map(); // New: User preferences
    
    // Performance features
    this.cache = this.config.enableCache ? new PerformanceCache(this.config.cacheSize, this.config.cacheTTL) : null;
    this.monitor = new PerformanceMonitor();
    this.compressionEnabled = this.config.enableCompression;
    this.optimizationEnabled = this.config.enableOptimization;
    
    // Performance optimization settings
    this.batchSize = 100;
    this.optimizationInterval = 60000; // 1 minute
    this.lastOptimization = Date.now();
    
    Logger.debug('[MemoryManager] Initialized successfully with performance features');
  }

  storeShort(item) {
    Logger.debug('[MemoryManager] Storing short-term item (redacted)');
    const entry = {
      ...item,
      timestamp: Date.now(),
      ttl: this.config.shortTTL
    };
    this.short.push(entry);
    Logger.debug(`[MemoryManager] Short-term memory count: ${this.short.length}`);
    this._cleanupShort();
  }

  // Advanced Context Management Methods
  storeContext(key, value, options = {}) {
    Logger.debug(`[MemoryManager] Storing context: ${key}`);
    const entry = {
      key,
      value,
      timestamp: Date.now(),
      ttl: options.ttl || this.config.shortTTL,
      tags: options.tags || [],
      priority: options.priority || 'normal',
      metadata: {
        ...options.metadata,
        source: options.source || 'manual',
        confidence: options.confidence || 1.0,
        lastUpdated: Date.now()
      }
    };
    this.context.set(key, entry);
    this._cleanupContext();
  }

  getContext(key) {
    const entry = this.context.get(key);
    if (!entry) return null;
    
    // Check TTL
    if (Date.now() - entry.timestamp > entry.ttl) {
      this.context.delete(key);
      return null;
    }
    
    return entry.value;
  }

  getContextByTags(tags) {
    const results = [];
    for (const [key, entry] of this.context.entries()) {
      if (tags.some(tag => entry.tags.includes(tag))) {
        if (Date.now() - entry.timestamp <= entry.ttl) {
          results.push({
            key,
            value: entry.value,
            timestamp: entry.timestamp,
            priority: entry.priority,
            metadata: entry.metadata
          });
        }
      }
    }
    return results.sort((a, b) => b.priority.localeCompare(a.priority));
  }

  // Advanced Context Awareness Methods
  getContextByPriority(priority = 'normal') {
    const results = [];
    for (const [key, entry] of this.context.entries()) {
      if (entry.priority === priority && Date.now() - entry.timestamp <= entry.ttl) {
        results.push({
          key,
          value: entry.value,
          timestamp: entry.timestamp,
          priority: entry.priority,
          metadata: entry.metadata
        });
      }
    }
    return results;
  }

  getContextBySource(source) {
    const results = [];
    for (const [key, entry] of this.context.entries()) {
      if (entry.metadata?.source === source && Date.now() - entry.timestamp <= entry.ttl) {
        results.push({
          key,
          value: entry.value,
          timestamp: entry.timestamp,
          priority: entry.priority,
          metadata: entry.metadata
        });
      }
    }
    return results;
  }

  getContextByConfidence(minConfidence = 0.5) {
    const results = [];
    for (const [key, entry] of this.context.entries()) {
      if (entry.metadata?.confidence >= minConfidence && Date.now() - entry.timestamp <= entry.ttl) {
        results.push({
          key,
          value: entry.value,
          timestamp: entry.timestamp,
          priority: entry.priority,
          metadata: entry.metadata
        });
      }
    }
    return results;
  }

  updateContext(key, value, options = {}) {
    const existing = this.context.get(key);
    if (!existing) {
      Logger.warn(`[MemoryManager] Context key '${key}' not found for update`);
      return false;
    }

    existing.value = value;
    existing.timestamp = Date.now();
    existing.ttl = options.ttl || existing.ttl;
    existing.priority = options.priority || existing.priority;
    existing.metadata.lastUpdated = Date.now();
    existing.metadata.confidence = options.confidence || existing.metadata.confidence;
    
    if (options.tags) {
      existing.tags = options.tags;
    }
    
    this.context.set(key, existing);
    Logger.debug(`[MemoryManager] Updated context: ${key}`);
    return true;
  }

  removeContext(key) {
    const removed = this.context.delete(key);
    if (removed) {
      Logger.debug(`[MemoryManager] Removed context: ${key}`);
    }
    return removed;
  }

  clearContextByTag(tag) {
    let count = 0;
    for (const [key, entry] of this.context.entries()) {
      if (entry.tags.includes(tag)) {
        this.context.delete(key);
        count++;
      }
    }
    Logger.debug(`[MemoryManager] Cleared ${count} context items with tag: ${tag}`);
    return count;
  }

  clearContextBySource(source) {
    let count = 0;
    for (const [key, entry] of this.context.entries()) {
      if (entry.metadata?.source === source) {
        this.context.delete(key);
        count++;
      }
    }
    Logger.debug(`[MemoryManager] Cleared ${count} context items from source: ${source}`);
    return count;
  }

  getContextRelationships() {
    const relationships = new Map();
    
    // Find relationships between context items
    for (const [key1, entry1] of this.context.entries()) {
      for (const [key2, entry2] of this.context.entries()) {
        if (key1 !== key2) {
          const similarity = this._calculateContextSimilarity(entry1, entry2);
          if (similarity > 0.3) {
            if (!relationships.has(key1)) {
              relationships.set(key1, []);
            }
            relationships.get(key1).push({
              relatedKey: key2,
              similarity,
              tagsOverlap: this._getTagsOverlap(entry1.tags, entry2.tags)
            });
          }
        }
      }
    }
    
    return relationships;
  }

  _calculateContextSimilarity(entry1, entry2) {
    const text1 = `${entry1.key} ${entry1.value || ''}`;
    const text2 = `${entry2.key} ${entry2.value || ''}`;
    const tokens1 = this._tokenize(text1.toLowerCase());
    const tokens2 = this._tokenize(text2.toLowerCase());
    return this._calculateSimilarity(tokens1, tokens2);
  }

  _getTagsOverlap(tags1, tags2) {
    const set1 = new Set(tags1);
    const set2 = new Set(tags2);
    const intersection = new Set([...set1].filter(x => set2.has(x)));
    return intersection.size / Math.max(set1.size, set2.size);
  }

  getContextTrends() {
    const trends = {
      tagFrequency: {},
      sourceFrequency: {},
      priorityDistribution: {},
      confidenceDistribution: {},
      temporalPatterns: {}
    };

    for (const [key, entry] of this.context.entries()) {
      // Tag frequency
      entry.tags.forEach(tag => {
        trends.tagFrequency[tag] = (trends.tagFrequency[tag] || 0) + 1;
      });

      // Source frequency
      const source = entry.metadata?.source || 'unknown';
      trends.sourceFrequency[source] = (trends.sourceFrequency[source] || 0) + 1;

      // Priority distribution
      trends.priorityDistribution[entry.priority] = (trends.priorityDistribution[entry.priority] || 0) + 1;

      // Confidence distribution
      const confidence = entry.metadata?.confidence || 0;
      const confidenceRange = Math.floor(confidence * 10) / 10; // Round to 0.1
      trends.confidenceDistribution[confidenceRange] = (trends.confidenceDistribution[confidenceRange] || 0) + 1;

      // Temporal patterns
      const hour = new Date(entry.timestamp).getHours();
      trends.temporalPatterns[hour] = (trends.temporalPatterns[hour] || 0) + 1;
    }

    return trends;
  }

  getContextInsights() {
    const insights = {
      mostImportant: this._getMostImportantContext(),
      mostFrequentTags: this._getMostFrequentTags(),
      contextHealth: this._getContextHealth(),
      recommendations: this._getContextRecommendations()
    };

    return insights;
  }

  _getMostImportantContext() {
    const highPriority = this.getContextByPriority('high');
    const highConfidence = this.getContextByConfidence(0.8);
    
    return {
      highPriority: highPriority.slice(0, 5),
      highConfidence: highConfidence.slice(0, 5),
      combined: [...highPriority, ...highConfidence].slice(0, 10)
    };
  }

  _getMostFrequentTags() {
    const tagCounts = {};
    for (const [key, entry] of this.context.entries()) {
      entry.tags.forEach(tag => {
        tagCounts[tag] = (tagCounts[tag] || 0) + 1;
      });
    }
    
    return Object.entries(tagCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10)
      .map(([tag, count]) => ({ tag, count }));
  }

  _getContextHealth() {
    const total = this.context.size;
    const expired = Array.from(this.context.values()).filter(entry =>
      Date.now() - entry.timestamp > entry.ttl
    ).length;
    
    const averageConfidence = this._getAverageContextConfidence();
    const coverage = this._getContextCoverage();
    
    return {
      total,
      expired,
      expiredPercentage: total > 0 ? (expired / total) * 100 : 0,
      averageConfidence,
      coverage,
      healthScore: this._calculateContextHealthScore(total, expired, averageConfidence, coverage)
    };
  }

  _getAverageContextConfidence() {
    const confidences = Array.from(this.context.values())
      .map(entry => entry.metadata?.confidence || 0)
      .filter(confidence => confidence > 0);
    
    return confidences.length > 0
      ? confidences.reduce((a, b) => a + b, 0) / confidences.length
      : 0;
  }

  _getContextCoverage() {
    const uniqueTags = new Set();
    const uniqueSources = new Set();
    
    for (const [key, entry] of this.context.entries()) {
      entry.tags.forEach(tag => uniqueTags.add(tag));
      uniqueSources.add(entry.metadata?.source || 'unknown');
    }
    
    return {
      uniqueTags: uniqueTags.size,
      uniqueSources: uniqueSources.size,
      averageTagsPerItem: this.context.size > 0 ? uniqueTags.size / this.context.size : 0
    };
  }

  _calculateContextHealthScore(total, expired, averageConfidence, coverage) {
    const expirationScore = total > 0 ? (1 - (expired / total)) : 1;
    const confidenceScore = Math.min(averageConfidence, 1);
    const coverageScore = Math.min(coverage.uniqueTags / 20, 1); // Normalize to 0-1
    
    return (expirationScore * 0.4) + (confidenceScore * 0.4) + (coverageScore * 0.2);
  }

  _getContextRecommendations() {
    const recommendations = [];
    const health = this._getContextHealth();
    
    if (health.expiredPercentage > 20) {
      recommendations.push({
        type: 'cleanup',
        message: `Consider cleaning up ${Math.round(health.expiredPercentage)}% expired context items`,
        priority: 'medium'
      });
    }
    
    if (health.averageConfidence < 0.7) {
      recommendations.push({
        type: 'confidence',
        message: `Average context confidence is low (${(health.averageConfidence * 100).toFixed(0)}%). Consider updating context with higher confidence values`,
        priority: 'high'
      });
    }
    
    if (health.coverage.uniqueTags < 5) {
      recommendations.push({
        type: 'diversity',
        message: `Context tag diversity is low. Consider adding more diverse context tags`,
        priority: 'low'
      });
    }
    
    return recommendations;
  }

  exportContext() {
    const exportData = {
      timestamp: Date.now(),
      version: '1.0',
      context: Object.fromEntries(this.context),
      insights: this.getContextInsights(),
      trends: this.getContextTrends(),
      health: this._getContextHealth()
    };
    
    return JSON.stringify(exportData, null, 2);
  }

  importContext(exportData) {
    try {
      const data = typeof exportData === 'string' ? JSON.parse(exportData) : exportData;
      
      if (!data.context || typeof data.context !== 'object') {
        throw new Error('Invalid context data format');
      }
      
      // Clear existing context
      this.context.clear();
      
      // Import new context
      Object.entries(data.context).forEach(([key, entry]) => {
        this.context.set(key, entry);
      });
      
      Logger.debug(`[MemoryManager] Imported ${Object.keys(data.context).length} context items`);
      return true;
    } catch (error) {
      Logger.error('[MemoryManager] Failed to import context:', error);
      return false;
    }
  }

  storeConversation(sessionId, message, options = {}) {
    Logger.debug(`[MemoryManager] Storing conversation: ${sessionId}`);
    if (!this.conversations.has(sessionId)) {
      this.conversations.set(sessionId, {
        messages: [],
        startTime: Date.now(),
        context: options.context || {},
        metadata: options.metadata || {}
      });
    }

    const session = this.conversations.get(sessionId);
    session.messages.push({
      ...message,
      timestamp: Date.now(),
      id: Date.now() + Math.random().toString(36).substr(2, 9)
    });

    // Keep only last 50 messages per session
    if (session.messages.length > 50) {
      session.messages = session.messages.slice(-50);
    }

    this._cleanupConversations();
  }

  getConversation(sessionId, limit = 10) {
    const session = this.conversations.get(sessionId);
    if (!session) return { messages: [], context: {}, metadata: {} };
    
    return {
      messages: session.messages.slice(-limit),
      context: session.context,
      metadata: session.metadata,
      startTime: session.startTime
    };
  }

  storePreference(key, value, options = {}) {
    Logger.debug(`[MemoryManager] Storing preference: ${key}`);
    const entry = {
      key,
      value,
      timestamp: Date.now(),
      category: options.category || 'general',
      persistent: options.persistent || false
    };
    this.preferences.set(key, entry);
  }

  getPreference(key) {
    const entry = this.preferences.get(key);
    return entry ? entry.value : null;
  }

  getPreferencesByCategory(category) {
    const results = {};
    for (const [key, entry] of this.preferences.entries()) {
      if (entry.category === category) {
        results[key] = entry.value;
      }
    }
    return results;
  }

  updateContextFromInput(input, analysis) {
    // Extract entities and context from input
    const entities = this._extractEntities(input);
    const intent = analysis.intent || [];
    
    // Store entities as context
    entities.forEach(entity => {
      this.storeContext(`entity_${entity.type}_${entity.value}`, entity.value, {
        tags: ['entity', entity.type],
        ttl: this.config.shortTTL * 2
      });
    });

    // Store intent as context
    intent.forEach(intentType => {
      this.storeContext(`intent_${intentType}`, true, {
        tags: ['intent'],
        ttl: this.config.shortTTL
      });
    });

    // Store time-based context
    const now = new Date();
    this.storeContext('time_of_day', this._getTimeOfDay(now), {
      tags: ['temporal'],
      ttl: this.config.shortTTL
    });
    
    this.storeContext('day_of_week', now.getDay(), {
      tags: ['temporal'],
      ttl: this.config.shortTTL
    });
  }

  _extractEntities(text) {
    const entities = [];
    
    // Extract email addresses
    const emailRegex = /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/g;
    const emails = text.match(emailRegex);
    if (emails) {
      emails.forEach(email => entities.push({ type: 'email', value: email }));
    }

    // Extract phone numbers
    const phoneRegex = /\b\d{3}[-.\s]?\d{3}[-.\s]?\d{4}\b/g;
    const phones = text.match(phoneRegex);
    if (phones) {
      phones.forEach(phone => entities.push({ type: 'phone', value: phone }));
    }

    // Extract dates
    const dateRegex = /\b\d{1,2}[\/\-]\d{1,2}[\/\-]\d{2,4}\b/g;
    const dates = text.match(dateRegex);
    if (dates) {
      dates.forEach(date => entities.push({ type: 'date', value: date }));
    }

    // Extract URLs
    const urlRegex = /https?:\/\/(www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_\+.~#?&//=]*)/g;
    const urls = text.match(urlRegex);
    if (urls) {
      urls.forEach(url => entities.push({ type: 'url', value: url }));
    }

    return entities;
  }

  _getTimeOfDay(date) {
    const hour = date.getHours();
    if (hour < 6) return 'night';
    if (hour < 12) return 'morning';
    if (hour < 18) return 'afternoon';
    return 'evening';
  }

  _cleanupContext() {
    const now = Date.now();
    for (const [key, entry] of this.context.entries()) {
      if (now - entry.timestamp > entry.ttl) {
        this.context.delete(key);
      }
    }
  }

  _cleanupConversations() {
    const now = Date.now();
    for (const [sessionId, session] of this.conversations.entries()) {
      // Remove conversations older than 24 hours
      if (now - session.startTime > 86400000) {
        this.conversations.delete(sessionId);
      }
    }
  }

  storeLong(item) {
    Logger.debug('[MemoryManager] Storing long-term item (redacted)');
    const entry = {
      ...item,
      timestamp: Date.now(),
      ttl: this.config.longTTL
    };
    this.long.push(entry);
    Logger.debug(`[MemoryManager] Long-term memory count: ${this.long.length}`);
    this._cleanupLong();
  }

  storeUser(key, value) {
    Logger.debug(`[MemoryManager] Storing user data for key: ${key}`);
    // Prevent prototype pollution
    if (key === '__proto__' || key === 'constructor' || key === 'prototype') {
      Logger.error('[MemoryManager] Blocked prototype pollution attempt');
      throw new SecurityError('Invalid user key');
    }
    this.user.set(key, value);
    Logger.debug(`[MemoryManager] User data stored. Map size: ${this.user.size}`);
  }

  getUser(key) {
    return this.user.get(key);
  }

  load() {
    Logger.debug('[MemoryManager] Loading memory state');
    this._cleanupAll();
    const state = {
      short: this.short.map(e => ({ ...e })), // Return copies
      long: this.long.map(e => ({ ...e })),
      user: Object.fromEntries(this.user)
    };
    Logger.debug(`[MemoryManager] Memory loaded. Short: ${state.short.length}, Long: ${state.long.length}, User: ${Object.keys(state.user).length}`);
    return state;
  }

  clearShort() {
    Logger.debug('[MemoryManager] Clearing short-term memory');
    this.short = [];
  }
  clearLong() {
    Logger.debug('[MemoryManager] Clearing long-term memory');
    this.long = [];
  }
  clearUser() {
    Logger.debug('[MemoryManager] Clearing user memory');
    this.user.clear();
  }

  _cleanupShort() {
    const now = Date.now();
    this.short = this.short.filter(entry => 
      (now - entry.timestamp) < entry.ttl
    );
    if (this.short.length > this.config.maxShort) {
      this.short = this.short.slice(-this.config.maxShort); // Keep recent
    }
  }

  _cleanupLong() {
    const now = Date.now();
    this.long = this.long.filter(entry => 
      (now - entry.timestamp) < entry.ttl
    );
    if (this.long.length > this.config.maxLong) {
      this.long = this.long.slice(-this.config.maxLong);
    }
  }

  _cleanupAll() {
    this._cleanupShort();
    this._cleanupLong();
  }

  getStats() {
    const stats = {
      shortCount: this.short.length,
      longCount: this.long.length,
      userCount: this.user.size,
      contextCount: this.context.size,
      conversationCount: this.conversations.size,
      preferenceCount: this.preferences.size,
      shortAge: this.short.length > 0 ?
        Date.now() - this.short[0].timestamp : 0,
      longAge: this.long.length > 0 ?
        Date.now() - this.long[0].timestamp : 0
    };
    Logger.debug('[MemoryManager] Stats:', stats);
    return stats;
  }

  // Enhanced Memory with Semantic Search
  async semanticSearch(query, options = {}) {
    Logger.debug('[MemoryManager] Performing semantic search (redacted) - length: ' + (typeof query === 'string' ? query.length : 'n/a'));
    
    const {
      limit = 10,
      threshold = 0.3,
      includeShort = true,
      includeLong = true,
      includeContext = true,
      includeConversations = true
    } = options;

    const results = [];
    
    // Search short-term memory
    if (includeShort) {
      const shortResults = this._searchMemoryArray(this.short, query, threshold);
      results.push(...shortResults.map(r => ({ ...r, source: 'short' })));
    }
    
    // Search long-term memory
    if (includeLong) {
      const longResults = this._searchMemoryArray(this.long, query, threshold);
      results.push(...longResults.map(r => ({ ...r, source: 'long' })));
    }
    
    // Search context
    if (includeContext) {
      const contextResults = this._searchContext(query, threshold);
      results.push(...contextResults.map(r => ({ ...r, source: 'context' })));
    }
    
    // Search conversations
    if (includeConversations) {
      const conversationResults = this._searchConversations(query, threshold);
      results.push(...conversationResults.map(r => ({ ...r, source: 'conversation' })));
    }
    
    // Sort by similarity score
    results.sort((a, b) => b.similarity - a.similarity);
    
    // Apply limit
    const limitedResults = results.slice(0, limit);
    
    Logger.debug('[MemoryManager] Semantic search completed', {
      queryLength: typeof query === 'string' ? query.length : 'n/a',
      found: limitedResults.length,
      total: results.length
    });
    
    return limitedResults;
  }

  _searchMemoryArray(memoryArray, query, threshold) {
    const results = [];
    const queryTokens = this._tokenize(query.toLowerCase());
    
    memoryArray.forEach((item, index) => {
      const text = this._extractTextFromMemoryItem(item);
      const textTokens = this._tokenize(text.toLowerCase());
      const similarity = this._calculateSimilarity(queryTokens, textTokens);
      
      if (similarity >= threshold) {
        results.push({
          item,
          index,
          similarity,
          relevance: this._calculateRelevance(item, similarity)
        });
      }
    });
    
    return results;
  }

  _searchContext(query, threshold) {
    const results = [];
    const queryTokens = this._tokenize(query.toLowerCase());
    
    for (const [key, entry] of this.context.entries()) {
      const text = `${key} ${entry.value || ''}`;
      const textTokens = this._tokenize(text.toLowerCase());
      const similarity = this._calculateSimilarity(queryTokens, textTokens);
      
      if (similarity >= threshold) {
        results.push({
          key,
          value: entry.value,
          tags: entry.tags,
          similarity,
          relevance: this._calculateRelevance(entry, similarity)
        });
      }
    }
    
    return results;
  }

  _searchConversations(query, threshold) {
    const results = [];
    const queryTokens = this._tokenize(query.toLowerCase());
    
    for (const [sessionId, session] of this.conversations.entries()) {
      const conversationText = session.messages.map(m => m.input || m.response || '').join(' ');
      const textTokens = this._tokenize(conversationText.toLowerCase());
      const similarity = this._calculateSimilarity(queryTokens, textTokens);
      
      if (similarity >= threshold) {
        results.push({
          sessionId,
          messages: session.messages,
          context: session.context,
          similarity,
          relevance: this._calculateRelevance(session, similarity)
        });
      }
    }
    
    return results;
  }

  _tokenize(text) {
    // Remove punctuation and split into words
    return text
      .replace(/[^\w\s]/g, '')
      .split(/\s+/)
      .filter(token => token.length > 2)
      .map(token => token.toLowerCase());
  }

  _calculateSimilarity(tokens1, tokens2) {
    if (tokens1.length === 0 || tokens2.length === 0) return 0;
    
    // Calculate Jaccard similarity
    const set1 = new Set(tokens1);
    const set2 = new Set(tokens2);
    
    const intersection = new Set([...set1].filter(x => set2.has(x)));
    const union = new Set([...set1, ...set2]);
    
    return intersection.size / union.size;
  }

  _calculateRelevance(item, similarity) {
    let relevance = similarity;
    
    // Boost based on recency
    if (item.timestamp) {
      const age = Date.now() - item.timestamp;
      const recencyBoost = Math.max(0, 1 - (age / (24 * 60 * 60 * 1000))); // Decay over 24 hours
      relevance *= (1 + recencyBoost * 0.5);
    }
    
    // Boost based on priority (for context items)
    if (item.priority) {
      const priorityBoost = item.priority === 'high' ? 0.3 : item.priority === 'medium' ? 0.15 : 0;
      relevance *= (1 + priorityBoost);
    }
    
    // Boost based on type
    if (item.type === 'fact') {
      relevance *= 1.2;
    } else if (item.type === 'interaction') {
      relevance *= 1.1;
    }
    
    return Math.min(relevance, 1.0);
  }

  _extractTextFromMemoryItem(item) {
    const textParts = [];
    
    if (item.input) textParts.push(item.input);
    if (item.response) textParts.push(item.response);
    if (item.question) textParts.push(item.question);
    if (item.answer) textParts.push(item.answer);
    if (item.content) textParts.push(item.content);
    if (item.type) textParts.push(item.type);
    
    return textParts.join(' ');
  }

  // Memory optimization methods
  optimizeMemory() {
    Logger.debug('[MemoryManager] Optimizing memory...');
    
    // Clean up expired items
    this._cleanupAll();
    
    // Compress long-term memory if too large
    if (this.long.length > this.config.maxLong * 0.8) {
      this._compressLongTermMemory();
    }
    
    // Compress conversations if too large
    if (this.conversations.size > 50) {
      this._compressConversations();
    }
    
    Logger.debug('[MemoryManager] Memory optimization complete');
  }

  _compressLongTermMemory() {
    Logger.debug('[MemoryManager] Compressing long-term memory');
    
    // Sort by relevance and keep only most relevant
    this.long.sort((a, b) => {
      const aRelevance = this._calculateRelevance(a, 1);
      const bRelevance = this._calculateRelevance(b, 1);
      return bRelevance - aRelevance;
    });
    
    // Keep only top 80% and clear the rest
    const keepCount = Math.floor(this.long.length * 0.8);
    this.long = this.long.slice(0, keepCount);
    
    Logger.debug(`[MemoryManager] Compressed long-term memory to ${this.long.length} items`);
  }

  _compressConversations() {
    Logger.debug('[MemoryManager] Compressing conversations');
    
    // Keep only recent conversations
    const now = Date.now();
    const conversationsArray = Array.from(this.conversations.entries());
    
    // Sort by last activity
    conversationsArray.sort((a, b) => {
      const aLastActivity = Math.max(...a[1].messages.map(m => m.timestamp));
      const bLastActivity = Math.max(...b[1].messages.map(m => m.timestamp));
      return bLastActivity - aLastActivity;
    });
    
    // Keep only most recent 30 conversations
    const keepCount = 30;
    const toKeep = conversationsArray.slice(0, keepCount);
    const toRemove = conversationsArray.slice(keepCount);
    
    // Clear old conversations
    toRemove.forEach(([sessionId]) => {
      this.conversations.delete(sessionId);
    });
    
    Logger.debug(`[MemoryManager] Compressed conversations to ${this.conversations.size} sessions`);
  }

  // Memory analytics
  getMemoryAnalytics() {
    const stats = this.getStats();
    
    const analytics = {
      ...stats,
      averageConfidence: this._calculateAverageConfidence(),
      mostCommonIntents: this._getMostCommonIntents(),
      memoryEfficiency: this._calculateMemoryEfficiency(),
      searchPerformance: this._getSearchPerformance(),
      performanceMetrics: this.monitor.getMetrics(),
      cacheStats: this.cache ? this.cache.getStats() : null
    };
    
    Logger.debug('[MemoryManager] Analytics:', analytics);
    return analytics;
  }

  // Performance Optimization Methods
  optimize() {
    if (!this.optimizationEnabled) return;
    
    const now = Date.now();
    if (now - this.lastOptimization < this.optimizationInterval) return;
    
    Logger.debug('[MemoryManager] Starting performance optimization...');
    this.monitor.startTimer('optimization');
    
    try {
      // Clean up expired items
      this._cleanupAll();
      
      // Optimize memory layout
      this._optimizeMemoryLayout();
      
      // Compress if enabled
      if (this.compressionEnabled) {
        this._compressMemory();
      }
      
      // Update cache statistics
      if (this.cache) {
        this.cache._cleanupExpired();
      }
      
      this.lastOptimization = now;
      const duration = this.monitor.endTimer('optimization');
      
      Logger.debug(`[MemoryManager] Optimization completed in ${duration.toFixed(2)}ms`);
      this.monitor.incrementCounter('optimizations');
      
    } catch (error) {
      Logger.error('[MemoryManager] Optimization failed:', error);
      this.monitor.endTimer('optimization');
    }
  }

  _optimizeMemoryLayout() {
    // Sort arrays by timestamp for better cache locality
    this.short.sort((a, b) => b.timestamp - a.timestamp);
    this.long.sort((a, b) => b.timestamp - a.timestamp);
    
    // Remove duplicates in context
    this._removeContextDuplicates();
    
    // Optimize conversation storage
    this._optimizeConversations();
  }

  _removeContextDuplicates() {
    const seen = new Set();
    const toRemove = [];
    
    for (const [key, entry] of this.context.entries()) {
      const text = `${entry.key}:${entry.value}`;
      if (seen.has(text)) {
        toRemove.push(key);
      } else {
        seen.add(text);
      }
    }
    
    toRemove.forEach(key => this.context.delete(key));
    if (toRemove.length > 0) {
      Logger.debug(`[MemoryManager] Removed ${toRemove.length} duplicate context items`);
    }
  }

  _optimizeConversations() {
    // Limit conversation message count
    for (const [sessionId, session] of this.conversations.entries()) {
      if (session.messages.length > 20) {
        // Keep only last 20 messages
        session.messages = session.messages.slice(-20);
      }
    }
  }

  _compressMemory() {
    // Simple compression by removing old low-priority items
    const now = Date.now();
    let removedCount = 0;
    
    // Compress short-term memory
    this.short = this.short.filter(item => {
      const age = now - item.timestamp;
      const isImportant = item.confidence > 0.8 || item.priority === 'high';
      
      if (age > this.config.shortTTL * 0.8 && !isImportant) {
        removedCount++;
        return false;
      }
      return true;
    });
    
    // Compress long-term memory
    this.long = this.long.filter(item => {
      const age = now - item.timestamp;
      const isImportant = item.confidence > 0.9 || item.priority === 'high';
      
      if (age > this.config.longTTL * 0.9 && !isImportant) {
        removedCount++;
        return false;
      }
      return true;
    });
    
    if (removedCount > 0) {
      Logger.debug(`[MemoryManager] Compressed ${removedCount} old memory items`);
    }
  }

  // Batch operations for better performance
  batchStore(items, type = 'short') {
    this.monitor.startTimer('batchStore');
    
    const results = [];
    const batchSize = this.batchSize;
    
    for (let i = 0; i < items.length; i += batchSize) {
      const batch = items.slice(i, i + batchSize);
      const batchResults = batch.map(item => {
        if (type === 'short') {
          this.storeShort(item);
          return { success: true, type: 'short' };
        } else if (type === 'long') {
          this.storeLong(item);
          return { success: true, type: 'long' };
        } else if (type === 'context') {
          this.storeContext(item.key, item.value, item.options);
          return { success: true, type: 'context' };
        }
        return { success: false, type };
      });
      results.push(...batchResults);
    }
    
    const duration = this.monitor.endTimer('batchStore');
    Logger.debug(`[MemoryManager] Batch stored ${items.length} items in ${duration.toFixed(2)}ms`);
    
    return results;
  }

  batchSemanticSearch(queries, options = {}) {
    this.monitor.startTimer('batchSearch');
    
    const results = queries.map(query => ({
      query,
      results: this.semanticSearch(query, options)
    }));
    
    const duration = this.monitor.endTimer('batchSearch');
    Logger.debug(`[MemoryManager] Batch searched ${queries.length} queries in ${duration.toFixed(2)}ms`);
    
    return results;
  }

  // Memory profiling
  profileMemory() {
    const profile = {
      timestamp: Date.now(),
      memory: this.getMemoryAnalytics(),
      performance: this.monitor.getMetrics(),
      cache: this.cache ? this.cache.getStats() : null,
      recommendations: this._getPerformanceRecommendations()
    };
    
    Logger.debug('[MemoryManager] Memory profile:', profile);
    return profile;
  }

  _getPerformanceRecommendations() {
    const recommendations = [];
    const memory = this.getMemoryAnalytics();
    
    // Check cache hit rate
    if (this.cache) {
      const cacheStats = this.cache.getStats();
      const hitRate = parseFloat(cacheStats.hitRate);
      
      if (hitRate < 50) {
        recommendations.push({
          type: 'cache',
          priority: 'medium',
          message: `Cache hit rate is low (${hitRate}%). Consider increasing cache size or TTL.`
        });
      }
    }
    
    // Check memory usage
    if (memory.memoryEfficiency && memory.memoryEfficiency.totalItems > 1000) {
      recommendations.push({
        type: 'memory',
        priority: 'high',
        message: 'High memory usage detected. Consider enabling compression or increasing cleanup frequency.'
      });
    }
    
    // Check search performance
    if (memory.searchPerformance && memory.searchPerformance.averageSearchTime > 100) {
      recommendations.push({
        type: 'search',
        priority: 'medium',
        message: `Search performance is slow (${memory.searchPerformance.averageSearchTime.toFixed(2)}ms). Consider using cache or optimizing search queries.`
      });
    }
    
    return recommendations;
  }

  // Memory diagnostics
  runDiagnostics() {
    const diagnostics = {
      timestamp: Date.now(),
      memoryLeaks: this._checkForMemoryLeaks(),
      performanceIssues: this._checkPerformanceIssues(),
      cacheHealth: this._checkCacheHealth(),
      optimizationStatus: this._checkOptimizationStatus()
    };
    
    Logger.debug('[MemoryManager] Diagnostics:', diagnostics);
    return diagnostics;
  }

  _checkForMemoryLeaks() {
    const leaks = [];
    
    // Check for excessive memory growth
    const stats = this.getStats();
    const totalItems = stats.shortCount + stats.longCount + stats.contextCount;
    
    if (totalItems > this.config.maxShort + this.config.maxLong + 1000) {
      leaks.push({
        type: 'excessive_growth',
        severity: 'high',
        message: `Memory contains ${totalItems} items, which may indicate a memory leak.`
      });
    }
    
    // Check for expired items not being cleaned up
    let expiredCount = 0;
    const now = Date.now();
    
    this.short.forEach(item => {
      if (now - item.timestamp > item.ttl) expiredCount++;
    });
    
    this.long.forEach(item => {
      if (now - item.timestamp > item.ttl) expiredCount++;
    });
    
    if (expiredCount > 100) {
      leaks.push({
        type: 'expired_items',
        severity: 'medium',
        message: `${expiredCount} expired items not cleaned up. Check cleanup frequency.`
      });
    }
    
    return leaks;
  }

  _checkPerformanceIssues() {
    const issues = [];
    const metrics = this.monitor.getMetrics();
    
    // Check for slow operations
    Object.entries(metrics.timers).forEach(([name, metric]) => {
      if (metric.avg > 1000) { // Slower than 1 second
        issues.push({
          type: 'slow_operation',
          operation: name,
          avgTime: metric.avg,
          message: `Operation '${name}' is slow (avg: ${metric.avg.toFixed(2)}ms)`
        });
      }
    });
    
    return issues;
  }

  _checkCacheHealth() {
    if (!this.cache) return { healthy: false, reason: 'Cache disabled' };
    
    const stats = this.cache.getStats();
    const hitRate = parseFloat(stats.hitRate);
    
    if (hitRate < 30) {
      return {
        healthy: false,
        hitRate,
        reason: 'Low cache hit rate'
      };
    }
    
    if (stats.utilization > 90) {
      return {
        healthy: false,
        utilization: stats.utilization,
        reason: 'Cache utilization too high'
      };
    }
    
    return {
      healthy: true,
      hitRate,
      utilization: stats.utilization
    };
  }

  _checkOptimizationStatus() {
    const now = Date.now();
    const timeSinceOptimization = now - this.lastOptimization;
    
    return {
      lastOptimization: this.lastOptimization,
      timeSinceOptimization,
      needsOptimization: timeSinceOptimization > this.optimizationInterval,
      optimizationEnabled: this.optimizationEnabled
    };
  }

  // Export/import with compression
  exportWithCompression() {
    const data = this.load();
    const compressed = this.compressionEnabled ? this._compressData(data) : data;
    
    return {
      version: '1.0',
      compressed: this.compressionEnabled,
      data: compressed,
      timestamp: Date.now(),
      size: JSON.stringify(compressed).length
    };
  }

  importWithCompression(exportData) {
    try {
      const data = typeof exportData === 'string' ? JSON.parse(exportData) : exportData;
      
      if (!data.data) {
        throw new Error('Invalid export data format');
      }
      
      const decompressed = data.compressed ? this._decompressData(data.data) : data.data;
      
      // Clear existing data
      this.clearShort();
      this.clearLong();
      this.clearUser();
      this.context.clear();
      this.conversations.clear();
      this.preferences.clear();
      
      // Restore data
      if (decompressed.short) {
        this.short = decompressed.short;
      }
      if (decompressed.long) {
        this.long = decompressed.long;
      }
      if (decompressed.user) {
        Object.entries(decompressed.user).forEach(([key, value]) => {
          this.user.set(key, value);
        });
      }
      
      Logger.debug(`[MemoryManager] Imported ${JSON.stringify(decompressed).length} bytes of data`);
      return true;
      
    } catch (error) {
      Logger.error('[MemoryManager] Import failed:', error);
      return false;
    }
  }

  _compressData(data) {
    // Simple compression by removing redundant fields
    const compressed = JSON.parse(JSON.stringify(data, (key, value) => {
      // Remove empty arrays and objects
      if (Array.isArray(value) && value.length === 0) return undefined;
      if (value && typeof value === 'object' && Object.keys(value).length === 0) return undefined;
      
      // Remove null values
      if (value === null) return undefined;
      
      return value;
    }));
    
    return compressed;
  }

  _decompressData(data) {
    // Decompression is just returning the data as-is for this simple implementation
    return data;
  }

  _calculateAverageConfidence() {
    const allItems = [...this.short, ...this.long];
    const confidenceItems = allItems.filter(item => typeof item.confidence === 'number');
    
    if (confidenceItems.length === 0) return 0;
    
    const totalConfidence = confidenceItems.reduce((sum, item) => sum + item.confidence, 0);
    return totalConfidence / confidenceItems.length;
  }

  _getMostCommonIntents() {
    const allItems = [...this.short, ...this.long];
    const intentCounts = {};
    
    allItems.forEach(item => {
      if (item.intent && Array.isArray(item.intent)) {
        item.intent.forEach(intent => {
          intentCounts[intent] = (intentCounts[intent] || 0) + 1;
        });
      }
    });
    
    return Object.entries(intentCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([intent, count]) => ({ intent, count }));
  }

  _calculateMemoryEfficiency() {
    const stats = this.getStats();
    const totalItems = stats.shortCount + stats.longCount + stats.contextCount;
    const totalSize = JSON.stringify(this.load()).length;
    
    return {
      totalItems,
      totalSize,
      averageItemSize: totalItems > 0 ? totalSize / totalItems : 0,
      compressionRatio: this._calculateCompressionRatio()
    };
  }

  _calculateCompressionRatio() {
    // Calculate how much space we're saving by having TTL and cleanup
    const rawSize = JSON.stringify({
      short: this.short,
      long: this.long,
      user: Object.fromEntries(this.user),
      context: Object.fromEntries(this.context),
      conversations: Object.fromEntries(this.conversations),
      preferences: Object.fromEntries(this.preferences)
    }).length;
    
    const compressedSize = JSON.stringify(this.load()).length;
    
    return {
      rawSize,
      compressedSize,
      ratio: rawSize > 0 ? compressedSize / rawSize : 1
    };
  }

  _getSearchPerformance() {
    // Simple performance metrics for search operations
    const searchTimes = [];
    
    // Test search performance with sample queries
    const testQueries = ['hello', 'error', 'help', 'test', 'example'];
    
    testQueries.forEach(query => {
      const start = performance.now();
      this.semanticSearch(query, { limit: 5 });
      const end = performance.now();
      searchTimes.push(end - start);
    });
    
    return {
      averageSearchTime: searchTimes.reduce((a, b) => a + b, 0) / searchTimes.length,
      minSearchTime: Math.min(...searchTimes),
      maxSearchTime: Math.max(...searchTimes),
      testQueries: testQueries.length
    };
  }
}

// ----------------- SAFETY ENGINE -----------------
class SafetyEngine {
  constructor(config = {}) {
    Logger.debug('[SafetyEngine] Initializing with config (redacted)');
    this.config = {
      blockedPatterns: [
        /jailbreak/i,
        /ignore previous/i,
        /system prompt/i,
        /__proto__/i,
        /constructor/i,
        /prototype/i,
        /eval\s*\(/i,
        /Function\s*\(/i,
        /document\.write/i,
        /innerHTML\s*=/i
      ],
      maxInputLength: 10000,
      maxWords: 1000,
      allowedProtocols: ['http', 'https', 'data', 'blob'],
      ...config
    };
    Logger.debug('[SafetyEngine] Initialized with blocked patterns count: ' + this.config.blockedPatterns.length);
  }

  validate(input, context = {}) {
    Logger.debug('[SafetyEngine] Validating input (redacted preview)');
    Logger.debug('[SafetyEngine] Context (redacted)');
    
    // Type check
    if (typeof input !== 'string') {
      Logger.error('[SafetyEngine] Type validation failed');
      throw new ValidationError('Input must be a string');
    }

    // Length check
    if (input.length > this.config.maxInputLength) {
      Logger.error(`[SafetyEngine] Length validation failed: ${input.length} > ${this.config.maxInputLength}`);
      throw new ValidationError(`Input exceeds maximum length of ${this.config.maxInputLength}`);
    }

    // Word count check
    const wordCount = input.trim().split(/\s+/).length;
    if (wordCount > this.config.maxWords) {
      Logger.error(`[SafetyEngine] Word count validation failed: ${wordCount} > ${this.config.maxWords}`);
      throw new ValidationError(`Input exceeds maximum word count of ${this.config.maxWords}`);
    }

    // Pattern check
    const sanitized = this.sanitize(input);
    const blockedPattern = this.config.blockedPatterns.find(pattern => pattern.test(sanitized));
    if (blockedPattern) {
      Logger.error(`[SafetyEngine] Blocked pattern found: ${blockedPattern}`);
      throw new SecurityError('Blocked unsafe input pattern');
    }

    // Context validation
    if (context.user && typeof context.user !== 'object') {
      Logger.error('[SafetyEngine] Context validation failed');
      throw new ValidationError('Invalid user context');
    }

    Logger.debug('[SafetyEngine] Validation passed');
    return sanitized;
  }

  sanitize(input) {
    // Lightly log that sanitization occurred (no user data logged unless debug enabled)
    Logger.debug('[SafetyEngine] Sanitizing input (first 50 chars redacted)');

    // Proper HTML entity encoding
    const sanitized = String(input)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/\"/g, '&quot;')
      .replace(/'/g, '&#39;');

    Logger.debug('[SafetyEngine] Sanitized result (length): ' + sanitized.length);
    return sanitized;
  }

  validateURL(url) {
    Logger.debug('[SafetyEngine] Validating URL (redacted)');
    try {
      const parsed = new URL(url);
      const protocol = parsed.protocol.replace(':', '');
      Logger.debug(`[SafetyEngine] URL protocol: ${protocol}`);
      
      if (!this.config.allowedProtocols.includes(protocol)) {
        Logger.error(`[SafetyEngine] Protocol not allowed: ${protocol}`);
        throw new SecurityError('Protocol not allowed');
      }
      Logger.debug('[SafetyEngine] URL validation passed');
      return true;
    } catch (e) {
      Logger.error(`[SafetyEngine] URL validation failed: ${e.message}`);
      throw new SecurityError('Invalid URL');
    }
  }
}

// ----------------- BRAIN RULES ENGINE -----------------
class BrainRules {
  static estimateConfidence(input, memory, context = {}) {
    let score = 0.9;
    const factors = [];

    // Input length
    if (input.length < 10) {
      score -= 0.3;
      factors.push('short_input');
    }

    // Memory availability
    if (!memory.short || memory.short.length === 0) {
      score -= 0.1;
      factors.push('no_memory');
    }

    // Specific keywords
    if (input.toLowerCase().includes('homework')) {
      score -= 0.2;
      factors.push('homework_detected');
    }

    // Complexity indicators
    if (input.includes('?') || input.includes('clarify')) {
      score += 0.1;
      factors.push('question_detected');
    }

    // Context boost
    if (context.user && Object.keys(context.user).length > 0) {
      score += 0.05;
      factors.push('user_context');
    }

    return {
      score: Math.max(0, Math.min(score, 1)),
      factors
    };
  }

  static shouldAsk(analysis) {
    const { confidence, fixable, context } = analysis;
    
    // Don't ask if we have high confidence
    if (confidence >= 0.8) return false;
    
    // Ask if low confidence and fixable
    if (confidence < 0.65 && fixable) return true;
    
    // Ask if very low confidence regardless
    if (confidence < 0.4) return true;
    
    // Ask if user context suggests clarification needed
    if (context?.needsClarification) return true;
    
    return false;
  }

  static needsVision(input) {
    const keywords = [
      'error', 'bug', 'not working', 'check code', 'fix this',
      'screenshot', 'screen', 'display', 'visual', 'see',
      'what do you see', 'look at', 'examine'
    ];
    
    const lower = input.toLowerCase();
    return keywords.some(k => lower.includes(k));
  }

  static isFixable(input) {
    const fixableKeywords = ['error', 'clarify', 'homework', 'help', 'explain'];
    return fixableKeywords.some(k => input.toLowerCase().includes(k));
  }

  static extractIntent(input) {
    const patterns = {
      question: /\?|what|how|why|when|where|who|which/i,
      command: /^(please|do|make|create|build|write|generate)/i,
      bug: /error|bug|issue|problem|fail/i,
      explain: /explain|describe|tell|show/i,
      fix: /fix|repair|solve|correct/i
    };

    const intents = [];
    for (const [intent, pattern] of Object.entries(patterns)) {
      if (pattern.test(input)) intents.push(intent);
    }

    return intents.length > 0 ? intents : ['general'];
  }
}

// ----------------- UI MANAGER -----------------
class UIManager {
  constructor(container, config = {}) {
    Logger.debug('[UIManager] Initializing with container (redacted)');
    this.container = container || document.body;
    this.config = {
      className: 'neuro-container',
      animationInterval: 400,
      maxDots: 4,
      ...config
    };
    this.currentAnimation = null;
    this.eventListeners = [];
    this.styleElement = null;
    this.init();
  }

  init() {
    // Inject styles
    this.styleElement = document.createElement('style');
    this.styleElement.textContent = `
      .${this.config.className} {
        font-family: system-ui, -apple-system, monospace;
        font-size: 13px;
        color: #cfcfcf;
        display: flex;
        align-items: center;
        gap: 8px;
        padding: 8px 12px;
        background: #1a1a1a;
        border-radius: 6px;
        border: 1px solid #333;
        margin: 4px;
        min-height: 32px;
        transition: all 0.3s ease;
        position: relative;
      }
      .${this.config.className} button {
        background: #4a4a4a;
        color: #fff;
        border: 1px solid #666;
        padding: 6px 12px;
        border-radius: 4px;
        cursor: pointer;
        font-size: 12px;
        transition: all 0.2s ease;
      }
      .${this.config.className} button:hover {
        background: #5a5a5a;
        transform: translateY(-1px);
      }
      .${this.config.className} button:active {
        background: #3a3a3a;
        transform: translateY(0);
      }
      .${this.config.className} .neuro-input {
        background: #2a2a2a;
        border: 1px solid #444;
        color: #fff;
        padding: 6px 10px;
        border-radius: 4px;
        font-size: 12px;
        width: 200px;
        transition: all 0.2s ease;
      }
      .${this.config.className} .neuro-input:focus {
        outline: none;
        border-color: #668fff;
        box-shadow: 0 0 0 2px rgba(102, 143, 255, 0.2);
      }
      .${this.config.className} .neuro-question {
        font-weight: 600;
        color: #fff;
        margin-right: 8px;
      }
      .${this.config.className} .neuro-state {
        display: inline-block;
        min-width: 60px;
      }
      .${this.config.className} .neuro-progress {
        width: 100%;
        height: 2px;
        background: #333;
        border-radius: 1px;
        overflow: hidden;
        margin-top: 4px;
      }
      .${this.config.className} .neuro-progress-bar {
        height: 100%;
        background: linear-gradient(90deg, #668fff, #8b5cf6);
        width: 0%;
        transition: width 0.3s ease;
      }
      .${this.config.className} .neuro-badge {
        background: #2a2a2a;
        border: 1px solid #444;
        padding: 2px 6px;
        border-radius: 3px;
        font-size: 10px;
        margin-left: 4px;
      }
      .${this.config.className} .neuro-tooltip {
        position: absolute;
        background: #2a2a2a;
        border: 1px solid #444;
        padding: 4px 8px;
        border-radius: 4px;
        font-size: 11px;
        z-index: 10000;
        pointer-events: none;
        opacity: 0;
        transition: opacity 0.2s ease;
      }
      .${this.config.className} .neuro-tooltip.visible {
        opacity: 1;
      }
      .${this.config.className} .neuro-grid {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
        gap: 8px;
        width: 100%;
      }
      .${this.config.className} .neuro-card {
        padding: 8px;
        border-radius: 4px;
        border: 1px solid #444;
        background: #2a2a2a;
        cursor: pointer;
        transition: all 0.2s ease;
      }
      .${this.config.className} .neuro-card:hover {
        border-color: #668fff;
        transform: translateY(-2px);
        box-shadow: 0 4px 12px rgba(102, 143, 255, 0.15);
      }
      .${this.config.className} .neuro-card-title {
        font-weight: 600;
        color: #fff;
        margin-bottom: 4px;
      }
      .${this.config.className} .neuro-card-desc {
        font-size: 11px;
        color: #999;
      }
      .${this.config.className} .neuro-skeleton {
        background: linear-gradient(90deg, #2a2a2a 25%, #333 50%, #2a2a2a 75%);
        background-size: 200% 100%;
        animation: neuro-skeleton-loading 1.5s infinite;
        border-radius: 4px;
      }
      @keyframes neuro-skeleton-loading {
        0% { background-position: 200% 0; }
        100% { background-position: -200% 0; }
      }
      .${this.config.className} .neuro-animated-text {
        overflow: hidden;
        white-space: nowrap;
        animation: neuro-typing 0.5s steps(40, end);
      }
      @keyframes neuro-typing {
        from { width: 0; }
        to { width: 100%; }
      }
      .${this.config.className} .neuro-smart-container {
        display: flex;
        flex-wrap: wrap;
        gap: 8px;
        align-items: center;
      }
      .${this.config.className} .neuro-smart-item {
        background: rgba(102, 143, 255, 0.1);
        border: 1px solid rgba(102, 143, 255, 0.3);
        padding: 4px 8px;
        border-radius: 4px;
        font-size: 11px;
        transition: all 0.2s ease;
      }
      .${this.config.className} .neuro-smart-item:hover {
        background: rgba(102, 143, 255, 0.2);
        transform: scale(1.05);
      }
    `;
    document.head.appendChild(this.styleElement);

    // Create container
    this.element = document.createElement('div');
    this.element.className = this.config.className;
    this.container.appendChild(this.element);
    
    // Create tooltip element
    this.tooltip = document.createElement('div');
    this.tooltip.className = 'neuro-tooltip';
    this.container.appendChild(this.tooltip);
  }

  setState(state, data = {}) {
    Logger.debug(`[UIManager] Setting state to: ${state}`);
    this.cleanupCurrentState();

    const states = {
      idle: this._renderIdle.bind(this),
      thinking: this._renderThinking.bind(this),
      writing: this._renderWriting.bind(this),
      asking: this._renderAsking.bind(this),
      viewingImage: this._renderViewingImage.bind(this),
      error: this._renderError.bind(this),
      success: this._renderSuccess.bind(this)
    };

    const renderer = states[state];
    if (renderer) {
      this.currentAnimation = renderer(data);
      Logger.debug(`[UIManager] State ${state} rendered successfully`);
    } else {
      Logger.warn(`[UIManager] Unknown state: ${state}`);
    }
  }

  cleanupCurrentState() {
    Logger.debug('[UIManager] Cleaning up current state');
    if (this.currentAnimation?.cleanup) {
      try {
        this.currentAnimation.cleanup();
        Logger.debug('[UIManager] Animation cleanup completed');
      } catch (e) {
        Logger.warn('Animation cleanup failed:', e);
      }
    }
    this.currentAnimation = null;
    this.element.innerHTML = '';
    Logger.debug('[UIManager] State cleanup completed');
  }

  _renderIdle() {
    Logger.debug('[UIManager] Rendering idle state');
    const span = document.createElement('span');
    span.textContent = 'Ready';
    span.className = 'neuro-state';
    this.element.appendChild(span);
    return { cleanup: () => {} };
  }

  _renderThinking() {
    Logger.debug('[UIManager] Rendering thinking state');
    const span = document.createElement('span');
    span.className = 'neuro-state';
    let count = 0;
    
    const interval = setInterval(() => {
      const dots = '.'.repeat((count % this.config.maxDots) + 1);
      span.textContent = `Thinking${dots}`;
      count++;
    }, this.config.animationInterval);

    this.element.appendChild(span);
    
    return {
      cleanup: () => {
        Logger.debug('[UIManager] Cleaning up thinking animation');
        clearInterval(interval);
      }
    };
  }

  _renderWriting() {
    Logger.debug('[UIManager] Rendering writing state');
    const span = document.createElement('span');
    span.className = 'neuro-state';
    span.textContent = 'Writing';
    let up = true;
    let frameId;

    const animate = () => {
      const offset = up ? -1 : 1;
      span.style.transform = `translateY(${offset}px)`;
      up = !up;
      frameId = requestAnimationFrame(animate);
    };

    animate();
    this.element.appendChild(span);

    return {
      cleanup: () => {
        Logger.debug('[UIManager] Cleaning up writing animation');
        if (frameId) cancelAnimationFrame(frameId);
        span.style.transform = '';
      }
    };
  }

  _renderAsking(data) {
    const { question, options = ['Yes', 'No'] } = data;
    
    const questionEl = document.createElement('span');
    questionEl.className = 'neuro-question';
    questionEl.textContent = question || 'Do you mean:';
    this.element.appendChild(questionEl);

    const resolve = (value) => {
      this.cleanupCurrentState();
      if (this.currentPromise) {
        this.currentPromise.resolve(value);
      }
    };

    options.forEach(opt => {
      const btn = document.createElement('button');
      btn.textContent = opt;
      btn.onclick = () => resolve(opt);
      this.element.appendChild(btn);
    });

    // Add input option
    const input = document.createElement('input');
    input.type = 'text';
    input.className = 'neuro-input';
    input.placeholder = 'Custom answer...';
    input.onkeydown = (e) => {
      if (e.key === 'Enter' && input.value.trim()) {
        resolve(input.value.trim());
      }
    };
    this.element.appendChild(input);

    return {
      cleanup: () => {
        // Cleanup handled by setState
      }
    };
  }

  _renderViewingImage() {
    const span = document.createElement('span');
    span.className = 'neuro-state';
    span.textContent = '📷 Viewing screen...';
    this.element.appendChild(span);
    
    // Create overlay container for highlighting
    const overlay = document.createElement('div');
    overlay.className = 'neuro-overlay';
    overlay.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      width: 100vw;
      height: 100vh;
      pointer-events: none;
      z-index: 9999;
      display: none;
    `;
    
    // Create canvas for drawing highlights
    const canvas = document.createElement('canvas');
    // generate a unique id to avoid collisions if multiple instances are present
    const uniqueId = 'neuro-highlight-canvas-' + Math.floor(Math.random() * 1e9);
    canvas.id = uniqueId;
    canvas.style.cssText = `
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
    `;
    overlay.appendChild(canvas);
    
    document.body.appendChild(overlay);
    
    return {
      cleanup: () => {
        if (overlay.parentNode) {
          overlay.parentNode.removeChild(overlay);
        }
      },
      highlight: (rects, options = {}) => {
        this._drawHighlights(canvas, rects, options);
      }
    };
  }

  _drawHighlights(canvas, rects, options) {
    const ctx = canvas.getContext('2d');
    const rect = canvas.getBoundingClientRect();
    
    // Clear previous highlights
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Set canvas size to match viewport
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    
    rects.forEach((highlight, index) => {
      const {
        x = 0,
        y = 0,
        width = 100,
        height = 100,
        color = '#ff4757',
        label = '',
        pulse = true
      } = highlight;
      
      // Draw highlight rectangle
      ctx.save();
      ctx.globalAlpha = 0.3;
      ctx.fillStyle = color;
      ctx.fillRect(x, y, width, height);
      
      // Draw border
      ctx.globalAlpha = 1;
      ctx.lineWidth = 3;
      ctx.strokeStyle = color;
      ctx.strokeRect(x, y, width, height);
      
      // Add pulse effect
      if (pulse) {
        const pulseOffset = Math.sin(Date.now() / 200 + index) * 5;
        ctx.lineWidth = 2 + pulseOffset;
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.8)';
        ctx.strokeRect(x - 2, y - 2, width + 4, height + 4);
      }
      
      // Add label
      if (label) {
        ctx.fillStyle = '#fff';
        ctx.font = '12px system-ui, -apple-system, sans-serif';
        ctx.textAlign = 'left';
        ctx.textBaseline = 'top';
        ctx.fillText(label, x + 5, y + 5);
      }
      ctx.restore();
    });
  }

  showOverlay(rects, options = {}) {
    const overlay = document.querySelector('.neuro-overlay');
    if (overlay) {
      overlay.style.display = 'block';
      const canvas = overlay.querySelector('canvas');
      if (canvas) {
        this._drawHighlights(canvas, rects, options);
      }
    }
  }

  hideOverlay() {
    const overlay = document.querySelector('.neuro-overlay');
    if (overlay) {
      overlay.style.display = 'none';
    }
  }

  static async analyzeImage(dataUrl, prompt = 'Describe this image') {
    Logger.debug('[VisionEngine] Analyzing image with prompt (redacted)');
    
    // Placeholder for actual AI vision analysis
    // In a real implementation, this would call a vision API
    const analysis = {
      description: 'Image analysis placeholder',
      dataUrl: dataUrl.substring(0, 100) + '...',
      highlights: this._detectErrorPatterns(dataUrl)
    };
    
    Logger.debug('[VisionEngine] Image analysis complete');
    return analysis;
  }

  static _detectErrorPatterns(dataUrl) {
    Logger.debug('[VisionEngine] Detecting error patterns in image');
    
    // Create temporary image to analyze
    const img = new Image();
    img.src = dataUrl;
    
    return new Promise((resolve) => {
      img.onload = () => {
        const highlights = [];
        
        // Analyze for common error patterns
        const canvas = document.createElement('canvas');
        canvas.width = img.width;
        canvas.height = img.height;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0);
        
        // Get image data for analysis
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const data = imageData.data;
        
        // Look for red/error indicators (common in error messages)
        const redRegions = this._findRedRegions(data, canvas.width, canvas.height);
        highlights.push(...redRegions);
        
        // Look for text patterns that might indicate errors
        const textRegions = this._findTextRegions(data, canvas.width, canvas.height);
        highlights.push(...textRegions);
        
        Logger.debug('[VisionEngine] Detected highlights');
        resolve(highlights);
      };
      
      img.onerror = () => {
        Logger.warn('[VisionEngine] Image analysis failed');
        resolve([]);
      };
    });
  }

  static _findRedRegions(data, width, height) {
    const highlights = [];
    const threshold = 50; // Minimum red intensity
    
    // Sample the image in a grid pattern
    const gridSize = 50;
    for (let y = 0; y < height; y += gridSize) {
      for (let x = 0; x < width; x += gridSize) {
        const index = (y * width + x) * 4;
        const r = data[index];
        const g = data[index + 1];
        const b = data[index + 2];
        
        // Check for red regions (common in error messages)
        if (r > threshold && r > g + 20 && r > b + 20) {
          highlights.push({
            x: x,
            y: y,
            width: gridSize,
            height: gridSize,
            color: '#ff4757',
            label: 'Error indicator detected',
            pulse: true
          });
        }
      }
    }
    
    return highlights;
  }

  static _findTextRegions(data, width, height) {
    const highlights = [];
    
    // Simple edge detection to find text-like patterns
    const gridSize = 40;
    for (let y = 10; y < height - 10; y += gridSize) {
      for (let x = 10; x < width - 10; x += gridSize) {
        const index = (y * width + x) * 4;
        const r = data[index];
        const g = data[index + 1];
        const b = data[index + 2];
        
        // Look for high contrast areas (likely text)
        const brightness = (r + g + b) / 3;
        if (brightness < 100 || brightness > 200) {
          highlights.push({
            x: x,
            y: y,
            width: gridSize,
            height: gridSize,
            color: '#3742fa',
            label: 'Text region',
            pulse: false
          });
        }
      }
    }
    
    return highlights;
  }

  _renderError(data) {
    const span = document.createElement('span');
    span.className = 'neuro-state';
    span.style.color = '#ff6b6b';
    span.textContent = `⚠️ ${data.message || 'Error occurred'}`;
    this.element.appendChild(span);
    return { cleanup: () => {} };
  }

  _renderSuccess(data) {
    const span = document.createElement('span');
    span.className = 'neuro-state';
    span.style.color = '#51cf66';
    span.textContent = `✓ ${data.message || 'Complete'}`;
    this.element.appendChild(span);
    return { cleanup: () => {} };
  }

  // Smart UI Generation Methods
  renderSmartUI(data) {
    Logger.debug('[UIManager] Rendering smart UI with data');
    this.cleanupCurrentState();
    
    const container = document.createElement('div');
    container.className = 'neuro-smart-container';
    
    // Render based on data type
    if (data.type === 'analysis') {
      this._renderAnalysisUI(container, data);
    } else if (data.type === 'options') {
      this._renderOptionsUI(container, data);
    } else if (data.type === 'progress') {
      this._renderProgressUI(container, data);
    } else if (data.type === 'cards') {
      this._renderCardsUI(container, data);
    } else {
      this._renderGenericSmartUI(container, data);
    }
    
    this.element.appendChild(container);
    
    return {
      cleanup: () => {
        container.remove();
      }
    };
  }

  _renderAnalysisUI(container, data) {
    const { confidence, factors, intent, highlights } = data;
    
    // Confidence badge
    const confidenceBadge = document.createElement('div');
    confidenceBadge.className = 'neuro-smart-item';
    confidenceBadge.textContent = `Confidence: ${(confidence * 100).toFixed(0)}%`;
    confidenceBadge.style.borderColor = confidence > 0.8 ? '#51cf66' : '#ff6b6b';
    confidenceBadge.style.color = confidence > 0.8 ? '#51cf66' : '#ff6b6b';
    container.appendChild(confidenceBadge);

    // Intent badges
    if (intent && intent.length > 0) {
      intent.forEach(int => {
        const intentBadge = document.createElement('div');
        intentBadge.className = 'neuro-smart-item';
        intentBadge.textContent = `Intent: ${int}`;
        intentBadge.style.borderColor = '#668fff';
        intentBadge.style.color = '#668fff';
        container.appendChild(intentBadge);
      });
    }

    // Factors
    if (factors && factors.length > 0) {
      const factorsBadge = document.createElement('div');
      factorsBadge.className = 'neuro-smart-item';
      factorsBadge.textContent = `Factors: ${factors.join(', ')}`;
      container.appendChild(factorsBadge);
    }

    // Highlights count
    if (highlights && highlights.length > 0) {
      const highlightsBadge = document.createElement('div');
      highlightsBadge.className = 'neuro-smart-item';
      highlightsBadge.textContent = `Highlights: ${highlights.length}`;
      highlightsBadge.style.borderColor = '#ff4757';
      highlightsBadge.style.color = '#ff4757';
      container.appendChild(highlightsBadge);
    }
  }

  _renderOptionsUI(container, data) {
    const { options, selected } = data;
    
    options.forEach((option, index) => {
      const optionEl = document.createElement('div');
      optionEl.className = 'neuro-smart-item';
      optionEl.textContent = option;
      optionEl.style.cursor = 'pointer';
      
      if (selected === index) {
        optionEl.style.background = 'rgba(81, 207, 102, 0.2)';
        optionEl.style.borderColor = '#51cf66';
        optionEl.style.color = '#51cf66';
      }
      
      optionEl.onclick = () => {
        this.emit('optionSelected', { option, index });
      };
      
      container.appendChild(optionEl);
    });
  }

  _renderProgressUI(container, data) {
    const { progress, total, label } = data;
    
    const progressContainer = document.createElement('div');
    progressContainer.className = 'neuro-progress';
    
    const progressBar = document.createElement('div');
    progressBar.className = 'neuro-progress-bar';
    progressBar.style.width = `${(progress / total) * 100}%`;
    
    progressContainer.appendChild(progressBar);
    container.appendChild(progressContainer);
    
    if (label) {
      const labelEl = document.createElement('div');
      labelEl.className = 'neuro-smart-item';
      labelEl.textContent = `${label}: ${progress}/${total}`;
      container.appendChild(labelEl);
    }
  }

  _renderCardsUI(container, data) {
    const { cards } = data;
    
    const grid = document.createElement('div');
    grid.className = 'neuro-grid';
    
    cards.forEach(card => {
      const cardEl = document.createElement('div');
      cardEl.className = 'neuro-card';
      
      const title = document.createElement('div');
      title.className = 'neuro-card-title';
      title.textContent = card.title;
      
      const desc = document.createElement('div');
      desc.className = 'neuro-card-desc';
      desc.textContent = card.description;
      
      cardEl.appendChild(title);
      cardEl.appendChild(desc);
      
      if (card.action) {
        cardEl.style.cursor = 'pointer';
        cardEl.onclick = () => {
          this.emit('cardAction', { card, action: card.action });
        };
      }
      
      grid.appendChild(cardEl);
    });
    
    container.appendChild(grid);
  }

  _renderGenericSmartUI(container, data) {
    // Fallback for unknown data types
    const text = document.createElement('div');
    text.className = 'neuro-smart-item';
    text.textContent = JSON.stringify(data, null, 2).substring(0, 100) + '...';
    container.appendChild(text);
  }

  showTooltip(text, position = {}) {
    if (!this.tooltip) return;
    
    this.tooltip.textContent = text;
    this.tooltip.style.left = `${position.x || 0}px`;
    this.tooltip.style.top = `${position.y || 0}px`;
    this.tooltip.classList.add('visible');
    
    // Auto-hide after 3 seconds
    setTimeout(() => {
      this.tooltip.classList.remove('visible');
    }, 3000);
  }

  hideTooltip() {
    if (this.tooltip) {
      this.tooltip.classList.remove('visible');
    }
  }

  createSkeletonLoader(count = 3) {
    const container = document.createElement('div');
    container.className = 'neuro-smart-container';
    
    for (let i = 0; i < count; i++) {
      const skeleton = document.createElement('div');
      skeleton.className = 'neuro-skeleton';
      skeleton.style.height = '16px';
      skeleton.style.width = `${Math.random() * 100 + 50}%`;
      container.appendChild(skeleton);
    }
    
    this.element.appendChild(container);
    
    return {
      cleanup: () => {
        container.remove();
      }
    };
  }

  askQuestion(question, options) {
    Logger.debug('[UIManager] Asking question');
    return new Promise((resolve, reject) => {
      this.currentPromise = { resolve, reject };
      this.setState('asking', { question, options });

      // Timeout after 30 seconds
      const timeout = setTimeout(() => {
        Logger.debug('[UIManager] Question timeout');
        this.cleanupCurrentState();
        reject(new Error('Question timeout'));
      }, 30000);

      // Override cleanup to clear timeout
      const originalCleanup = this.currentAnimation.cleanup;
      this.currentAnimation.cleanup = () => {
        clearTimeout(timeout);
        if (originalCleanup) originalCleanup();
      };
    });
  }

  destroy() {
    this.cleanupCurrentState();
    if (this.element?.parentElement) {
      this.element.remove();
    }
    if (this.styleElement?.parentElement) {
      this.styleElement.remove();
    }
    this.removeAllListeners();
  }

  // Event emitter methods for compatibility
  addEventListener(event, handler) {
    const remove = this.on(event, handler);
    this.eventListeners.push({ event, handler, remove });
  }

  removeAllListeners() {
    this.eventListeners.forEach(({ remove }) => remove());
    this.eventListeners = [];
  }

  on(event, listener) {
    if (!this.events) this.events = {};
    if (!this.events[event]) this.events[event] = [];
    this.events[event].push(listener);
    return () => this.off(event, listener);
  }

  off(event, listener) {
    if (!this.events?.[event]) return;
    this.events[event] = this.events[event].filter(l => l !== listener);
  }

  emit(event, data) {
    if (!this.events?.[event]) return;
    this.events[event].forEach(listener => {
      try {
        listener(data);
      } catch (e) {
        Logger.error(`Event listener error for ${event}:`, e);
      }
    });
  }
}

// ----------------- VISION ENGINE -----------------
class VisionEngine {
  static async requestScreenshot(options = {}) {
    const config = {
      maxWidth: 1920,
      maxHeight: 1080,
      quality: 0.8,
      fallbackToUpload: true,
      timeout: 10000,
      ...options
    };

    const timeoutPromise = new Promise((_, reject) => 
      setTimeout(() => reject(new Error('Screenshot timeout')), config.timeout)
    );

    try {
      const streamPromise = this._getScreenStream();
      const stream = await Promise.race([streamPromise, timeoutPromise]);

      const bitmap = await this._captureFrame(stream);
      const dataUrl = await this._canvasToDataURL(bitmap, config);
      
      // Cleanup
      stream.getTracks().forEach(track => track.stop());

      return dataUrl;

    } catch (error) {
      if (config.fallbackToUpload) {
        return await this._requestImageUpload();
      }
      throw new NeuroError('Screenshot failed', 'SCREENSHOT_FAILED', error);
    }
  }

  static async _getScreenStream() {
    if (!navigator.mediaDevices?.getDisplayMedia) {
      throw new Error('Screen capture not supported');
    }

    return await navigator.mediaDevices.getDisplayMedia({
      video: {
        frameRate: 1,
        width: { ideal: 1920 },
        height: { ideal: 1080 }
      },
      audio: false
    });
  }

  static async _captureFrame(stream) {
    const track = stream.getVideoTracks()[0];
    const imageCapture = new ImageCapture(track);
    
    // Wait for track to be ready
    await new Promise(resolve => {
      if (track.readyState === 'live') resolve();
      else track.onchange = () => {
        if (track.readyState === 'live') resolve();
      };
    });

    return await imageCapture.grabFrame();
  }

  static async _canvasToDataURL(bitmap, config) {
    const canvas = document.createElement('canvas');
    
    // Scale down if needed
    let { width, height } = bitmap;
    if (width > config.maxWidth || height > config.maxHeight) {
      const scale = Math.min(config.maxWidth / width, config.maxHeight / height);
      width = Math.floor(width * scale);
      height = Math.floor(height * scale);
    }

    canvas.width = width;
    canvas.height = height;

    const ctx = canvas.getContext('2d');
    ctx.drawImage(bitmap, 0, 0, width, height);

    return canvas.toDataURL('image/png', config.quality);
  }

  static async _requestImageUpload() {
    return new Promise((resolve, reject) => {
      const input = document.createElement('input');
      input.type = 'file';
      input.accept = 'image/*';
      
      input.onchange = async (e) => {
        const file = e.target.files[0];
        if (!file) {
          reject(new Error('No file selected'));
          return;
        }

        try {
          const reader = new FileReader();
          reader.onload = (event) => resolve(event.target.result);
          reader.onerror = () => reject(new Error('File read failed'));
          reader.readAsDataURL(file);
        } catch (error) {
          reject(error);
        }
      };

      input.onerror = () => reject(new Error('File input failed'));
      input.click();
    });
  }

  static async analyzeImage(dataUrl, prompt = 'Describe this image') {
    // Placeholder for actual AI vision analysis
    // In a real implementation, this would call a vision API
    return {
      description: 'Image analysis placeholder',
      dataUrl: dataUrl.substring(0, 100) + '...'
    };
  }
}

// ----------------- DEVELOPER TOOLS -----------------
class DeveloperTools {
  constructor(orchestrator) {
    this.orchestrator = orchestrator;
    this.debugMode = false;
    this.logLevel = 'info';
    this.profiler = null;
    this.recorder = null;
    
    this.setupEventListeners();
  }

  setupEventListeners() {
    // Listen to all orchestrator events for debugging
    const events = ['init', 'stateChange', 'visionRequested', 'visionCaptured', 'visionFailed',
                   'clarification', 'clarificationTimeout', 'complete', 'error', 'memoryCleared',
                   'memoryUpdated', 'memoryUpdateFailed', 'destroyed'];
    
    events.forEach(event => {
      this.orchestrator.on(event, (data) => {
        this.log(event, data);
      });
    });
  }

  enableDebug(mode = true) {
    this.debugMode = mode;
    this.log('debug', `Debug mode ${mode ? 'enabled' : 'disabled'}`);
    
    if (mode) {
      this.profiler = new PerformanceProfiler();
      this.recorder = new InteractionRecorder();
    }
  }

  setLogLevel(level) {
    this.logLevel = level;
    this.log('debug', `Log level set to: ${level}`);
  }

  log(level, message, data = null) {
    if (!this._shouldLog(level)) return;
    
    const timestamp = new Date().toISOString();
    const logEntry = {
      timestamp,
      level,
      message,
      data,
      memoryStats: this.orchestrator.memory.getStats(),
      state: this.orchestrator.state
    };
    
    // Output to console
    // Route logs through Logger so they respect the global debug setting
    if (level === 'error') {
      Logger.error(`[NeuroOrchestrator ${level.toUpperCase()}] ${message}`, data);
    } else if (level === 'warn') {
      Logger.warn(`[NeuroOrchestrator ${level.toUpperCase()}] ${message}`, data);
    } else {
      Logger.debug(`[NeuroOrchestrator ${level.toUpperCase()}] ${message}`, data);
    }
    
    // Store in profiler if active
    if (this.profiler) {
      this.profiler.addLog(logEntry);
    }
  }

  _shouldLog(level) {
    const levels = ['error', 'warn', 'info', 'debug'];
    const currentLevelIndex = levels.indexOf(this.logLevel);
    const messageLevelIndex = levels.indexOf(level);
    
    return this.debugMode && messageLevelIndex <= currentLevelIndex;
  }

  // Performance profiling
  startProfiling() {
    if (!this.profiler) {
      this.profiler = new PerformanceProfiler();
    }
    this.profiler.start();
    this.log('info', 'Performance profiling started');
  }

  stopProfiling() {
    if (this.profiler) {
      const report = this.profiler.stop();
      this.log('info', 'Performance profiling stopped', report);
      return report;
    }
    return null;
  }

  // Interaction recording
  startRecording() {
    if (!this.recorder) {
      this.recorder = new InteractionRecorder();
    }
    this.recorder.start();
    this.log('info', 'Interaction recording started');
  }

  stopRecording() {
    if (this.recorder) {
      const recording = this.recorder.stop();
      this.log('info', 'Interaction recording stopped', recording);
      return recording;
    }
    return null;
  }

  // Memory analysis
  analyzeMemory() {
    const analysis = {
      timestamp: Date.now(),
      memory: this.orchestrator.memory.getMemoryAnalytics(),
      diagnostics: this.orchestrator.memory.runDiagnostics(),
      recommendations: this.orchestrator.memory._getPerformanceRecommendations()
    };
    
    this.log('info', 'Memory analysis completed', analysis);
    return analysis;
  }

  // System health check
  healthCheck() {
    const health = {
      timestamp: Date.now(),
      orchestrator: {
        state: this.orchestrator.state,
        isProcessing: this.orchestrator.isProcessing,
        config: this.orchestrator.config
      },
      memory: this.orchestrator.memory.getMemoryAnalytics(),
      ui: this.orchestrator.ui ? {
        state: this.orchestrator.ui.state,
        hasAnimations: !!this.orchestrator.ui.currentAnimation
      } : null,
      safety: {
        blockedPatterns: this.orchestrator.safety.config.blockedPatterns.length,
        maxInputLength: this.orchestrator.safety.config.maxInputLength
      }
    };
    
    this.log('info', 'Health check completed', health);
    return health;
  }

  // Export debugging data
  exportDebugData() {
    const debugData = {
      timestamp: Date.now(),
      version: '1.0',
      debugMode: this.debugMode,
      logLevel: this.logLevel,
      health: this.healthCheck(),
      memory: this.analyzeMemory(),
      profiler: this.profiler ? this.profiler.getReport() : null,
      recorder: this.recorder ? this.recorder.getRecording() : null
    };
    
    return JSON.stringify(debugData, null, 2);
  }

  // Interactive debugging console
  openDebugConsole() {
    if (typeof window !== 'undefined') {
      window.__NeuroOrchestratorDebug = {
        orchestrator: this.orchestrator,
        tools: this,
        memory: this.orchestrator.memory,
        ui: this.orchestrator.ui,
        safety: this.orchestrator.safety,
        
        // Quick commands
        clearMemory: () => this.orchestrator.memory.clearMemory('all'),
        getStats: () => this.orchestrator.memory.getStats(),
        healthCheck: () => this.healthCheck(),
        analyzeMemory: () => this.analyzeMemory(),
        exportData: () => this.exportDebugData()
      };
      
      this.log('info', 'Debug console opened. Access via window.__NeuroOrchestratorDebug');
      Logger.debug('[NeuroOrchestrator] Debug console available at window.__NeuroOrchestratorDebug');
    }
  }
}

class PerformanceProfiler {
  constructor() {
    this.sessions = new Map();
    this.logs = [];
    this.active = false;
  }

  start() {
    this.active = true;
    this.startTime = performance.now();
    this.logs = [];
  }

  stop() {
    if (!this.active) return null;
    
    const duration = performance.now() - this.startTime;
    const report = {
      duration,
      logs: this.logs,
      sessionCount: this.sessions.size,
      averageSessionTime: this._calculateAverageSessionTime()
    };
    
    this.active = false;
    return report;
  }

  addLog(logEntry) {
    if (this.active) {
      this.logs.push(logEntry);
    }
  }

  addSession(sessionId, startTime, endTime, data) {
    this.sessions.set(sessionId, {
      startTime,
      endTime,
      duration: endTime - startTime,
      data
    });
  }

  _calculateAverageSessionTime() {
    if (this.sessions.size === 0) return 0;
    
    const total = Array.from(this.sessions.values())
      .reduce((sum, session) => sum + session.duration, 0);
    
    return total / this.sessions.size;
  }

  getReport() {
    return {
      active: this.active,
      sessionCount: this.sessions.size,
      logCount: this.logs.length,
      averageSessionTime: this._calculateAverageSessionTime(),
      sessions: Object.fromEntries(this.sessions)
    };
  }
}

class InteractionRecorder {
  constructor() {
    this.interactions = [];
    this.active = false;
    this.sessionId = null;
  }

  start() {
    this.active = true;
    this.sessionId = `session_${Date.now()}`;
    this.interactions = [];
  }

  stop() {
    if (!this.active) return null;
    
    const recording = {
      sessionId: this.sessionId,
      interactions: this.interactions,
      duration: this.interactions.length > 0 ?
        this.interactions[this.interactions.length - 1].timestamp - this.interactions[0].timestamp : 0
    };
    
    this.active = false;
    return recording;
  }

  recordInteraction(type, data) {
    if (this.active) {
      this.interactions.push({
        type,
        data,
        timestamp: Date.now()
      });
    }
  }

  getRecording() {
    return {
      active: this.active,
      sessionId: this.sessionId,
      interactionCount: this.interactions.length,
      interactions: this.interactions
    };
  }
}

// ----------------- AGENT CONTROLLER -----------------
class AgentController {
  constructor(orchestrator) {
    this.orchestrator = orchestrator;
    this.paused = false;
    this.pausePromise = null;
    this.resumeResolve = null;
    this.currentTask = null;
    this.taskQueue = [];
  }

  pause() {
    Logger.debug('[AgentController] Pausing agent');
    if (this.paused) {
      Logger.debug('[AgentController] Already paused');
      return;
    }
    
    this.paused = true;
    this.pausePromise = new Promise((resolve) => {
      this.resumeResolve = resolve;
    });
    
    this.orchestrator.emit('agentPaused', { timestamp: Date.now() });
    Logger.debug('[AgentController] Agent paused successfully');
  }

  resume() {
    Logger.debug('[AgentController] Resuming agent');
    if (!this.paused) {
      Logger.debug('[AgentController] Not paused');
      return;
    }
    
    this.paused = false;
    if (this.resumeResolve) {
      this.resumeResolve();
      this.resumeResolve = null;
    }
    
    this.orchestrator.emit('agentResumed', { timestamp: Date.now() });
    Logger.debug('[AgentController] Agent resumed successfully');
  }

  async waitForResume() {
    if (this.paused && this.pausePromise) {
      Logger.debug('[AgentController] Waiting for resume...');
      await this.pausePromise;
      Logger.debug('[AgentController] Resume confirmed');
    }
  }

  isPaused() {
    return this.paused;
  }

  clearQueue() {
    this.taskQueue = [];
    this.orchestrator.emit('queueCleared', { timestamp: Date.now() });
  }

  getQueueStatus() {
    return {
      paused: this.paused,
      queueLength: this.taskQueue.length,
      currentTask: this.currentTask
    };
  }
}

// ----------------- ORCHESTRATOR -----------------
class NeuroOrchestrator extends EventEmitter {
  constructor(container, options = {}) {
    super();
    
    this.config = {
      autoInit: true,
      enableAnimations: true,
      enableVision: true,
      enableDebug: false,
      enableProfiling: false,
      enableRecording: false,
      memoryConfig: {},
      safetyConfig: {},
      uiConfig: {},
      ...options
    };

    this.state = 'idle';
    this.isProcessing = false;
    this.memory = new MemoryManager(this.config.memoryConfig);
    this.safety = new SafetyEngine(this.config.safetyConfig);
    
    // Initialize agent controller for pause/resume functionality
    this.agentController = new AgentController(this);
    
    // Developer tools
    this.developerTools = new DeveloperTools(this);
    if (this.config.enableDebug) {
      this.developerTools.enableDebug(true);
    }
    
    if (this.config.enableProfiling) {
      this.developerTools.startProfiling();
    }
    
    if (this.config.enableRecording) {
      this.developerTools.startRecording();
    }
    
    if (this.config.enableAnimations && container) {
      this.ui = new UIManager(container, this.config.uiConfig);
    }

    if (this.config.autoInit) {
      this.init();
    }
  }

  init() {
    Logger.debug('[NeuroOrchestrator] Initializing...');
    this.emit('init', { timestamp: Date.now() });
    if (this.ui) {
      this.ui.setState('idle');
    }
    Logger.debug('[NeuroOrchestrator] Initialization complete');
  }

  async orchestrate(input, context = {}) {
Logger.debug('[NeuroOrchestrator] Starting orchestration with input (redacted)');
Logger.debug('[NeuroOrchestrator] Context (redacted)');
    
    // Generate session ID if not provided
    const sessionId = context.sessionId || `session_${Date.now()}`;
    Logger.debug('[NeuroOrchestrator] Session ID:', sessionId);
    
    // Performance monitoring
    const startTime = Date.now();
    this.memory.monitor.startTimer('orchestration');
    
    // Developer tools: Record interaction
    if (this.developerTools.recorder) {
      this.developerTools.recorder.recordInteraction('orchestration_start', {
        input: input.substring(0, 100),
        sessionId,
        context
      });
    }
    
    // Check if agent is paused and wait for resume
    if (this.agentController && this.agentController.isPaused()) {
      Logger.debug('[NeuroOrchestrator] Agent is paused, waiting for resume...');
      this.emit('taskQueued', { input: input.substring(0, 50), sessionId });
      await this.agentController.waitForResume();
      Logger.debug('[NeuroOrchestrator] Agent resumed, continuing orchestration');
    }
    
    // Prevent concurrent processing
    if (this.isProcessing) {
      Logger.error('[NeuroOrchestrator] Concurrent processing blocked');
      throw new NeuroError('Already processing', 'CONCURRENT_PROCESS');
    }

    this.isProcessing = true;

    try {
      // Performance monitoring: Input validation
      this.memory.monitor.startTimer('input_validation');
      
      // Validate input
      Logger.debug('[NeuroOrchestrator] Validating input...');
      const sanitizedInput = this.safety.validate(input, {
        user: this.memory.user,
        ...context
      });
      Logger.debug('[NeuroOrchestrator] Input validated (redacted)');
      
      this.memory.monitor.endTimer('input_validation');

      // Update state
      Logger.debug('[NeuroOrchestrator] Setting state to thinking');
      this._setState('thinking');
      this.emit('stateChange', { state: 'thinking', input: sanitizedInput });

      // Performance monitoring: Memory loading
      this.memory.monitor.startTimer('memory_loading');
      
      // Load context
      Logger.debug('[NeuroOrchestrator] Loading memory context');
      const memoryContext = this.memory.load();
      
      // Update context from input
      Logger.debug('[NeuroOrchestrator] Updating context from input');
      const analysis = BrainRules.estimateConfidence(sanitizedInput, memoryContext, context);
      this.memory.updateContextFromInput(sanitizedInput, analysis);
      
      // Get conversation context
      const conversation = this.memory.getConversation(sessionId);
      Logger.debug('[NeuroOrchestrator] Conversation context');
      
      // Get user preferences
      const preferences = this.memory.getPreferencesByCategory('general');
      Logger.debug('[NeuroOrchestrator] User preferences');
      
      // Get relevant context by tags
      const relevantContext = this.memory.getContextByTags(['entity', 'intent', 'temporal']);
      Logger.debug('[NeuroOrchestrator] Relevant context');
      
      this.memory.monitor.endTimer('memory_loading');

      // Check for vision needs
      let imageData = null;
      let highlights = [];
      if (this.config.enableVision && BrainRules.needsVision(sanitizedInput)) {
        Logger.debug('[NeuroOrchestrator] Vision needed, requesting screenshot');
        this._setState('viewingImage');
        this.emit('visionRequested', { input: sanitizedInput });
        
        try {
          // Performance monitoring: Vision capture
          this.memory.monitor.startTimer('vision_capture');
          
          imageData = await VisionEngine.requestScreenshot();
          Logger.debug('[NeuroOrchestrator] Screenshot captured, size:', imageData.length);
          
          // Analyze image for error patterns and highlights
          const visionAnalysis = await VisionEngine.analyzeImage(imageData, sanitizedInput);
          highlights = visionAnalysis.highlights || [];
          
          // Show highlights on screen
          if (highlights.length > 0 && this.ui) {
            this.ui.showOverlay(highlights, { autoHide: false });
            Logger.debug('[NeuroOrchestrator] Showing highlights');
          }
          
          this.memory.storeShort({
            type: 'vision',
            data: imageData,
            highlights: highlights,
            timestamp: Date.now()
          });
          this.emit('visionCaptured', { size: imageData.length, highlights: highlights });
          
          this.memory.monitor.endTimer('vision_capture');
        } catch (error) {
          Logger.warn('[NeuroOrchestrator] Vision failed:', error.message);
          this.emit('visionFailed', error);
          // Continue without vision
        }
      }

      // Analyze confidence
      Logger.debug('[NeuroOrchestrator] Analyzing confidence');
      const confidenceAnalysis = BrainRules.estimateConfidence(sanitizedInput, memoryContext, context);
      
      // Enhanced analysis with context
      const enhancedAnalysis = {
        ...confidenceAnalysis,
        conversationContext: conversation,
        userPreferences: preferences,
        relevantContext: relevantContext,
        sessionId: sessionId
      };
      Logger.debug('[NeuroOrchestrator] Enhanced analysis');
      const fixable = BrainRules.isFixable(sanitizedInput);
      const intent = BrainRules.extractIntent(sanitizedInput);
      Logger.debug('[NeuroOrchestrator] Analysis');
      
      // Store user preferences based on interaction
      if (intent.includes('bug')) {
        this.memory.storePreference('interaction_type', 'problem_solving', { category: 'behavior' });
      } else if (intent.includes('explain')) {
        this.memory.storePreference('interaction_type', 'learning', { category: 'behavior' });
      }
      
      // Store time-based preferences
      const timeOfDay = this.memory._getTimeOfDay(new Date());
      this.memory.storePreference('preferred_time', timeOfDay, { category: 'temporal', persistent: true });

      const shouldAsk = BrainRules.shouldAsk({
        confidence: confidenceAnalysis.score,
        fixable,
        context: { ...context, intent }
      });
      Logger.debug('[NeuroOrchestrator] Should ask user:', shouldAsk);

      // Ask user if needed
      let clarification = null;
      if (shouldAsk && this.ui) {
        Logger.debug('[NeuroOrchestrator] Requesting user clarification');
        this._setState('asking');
        const question = this._generateQuestion(sanitizedInput, confidenceAnalysis, intent);
        const options = this._generateOptions(intent);
        Logger.debug('[NeuroOrchestrator] Question');
        
        try {
          clarification = await this.ui.askQuestion(question, options);
          Logger.debug('[NeuroOrchestrator] User clarification');
          this.memory.storeShort({
            type: 'clarification',
            question,
            answer: clarification
          });
          this.emit('clarification', { question, answer: clarification });
        } catch (error) {
          console.warn('[NeuroOrchestrator] Clarification timeout:', error.message);
          this.emit('clarificationTimeout', error);
          // Continue with original input
        }
      }

      // Generate response
      Logger.debug('[NeuroOrchestrator] Generating response');
      this._setState('writing');
      
      // Performance monitoring: Response generation
      this.memory.monitor.startTimer('response_generation');
      
      const response = await this._generateResponse({
        input: sanitizedInput,
        clarification,
        imageData,
        highlights,
        analysis: enhancedAnalysis,
        intent,
        memory: memoryContext,
        context,
        sessionId
      });
      Logger.debug('[NeuroOrchestrator] Response generated (redacted)');
      
      this.memory.monitor.endTimer('response_generation');

      // Store in memory
      Logger.debug('[NeuroOrchestrator] Storing in memory');
      this.memory.storeShort({
        type: 'interaction',
        input: sanitizedInput,
        response,
        timestamp: Date.now(),
        confidence: enhancedAnalysis.score,
        highlights: highlights,
        sessionId: sessionId
      });

      // Store conversation
      this.memory.storeConversation(sessionId, {
        input: sanitizedInput,
        response: response,
        intent: intent,
        confidence: enhancedAnalysis.score,
        highlights: highlights
      }, {
        context: {
          hasVision: !!imageData,
          hasClarification: !!clarification
        },
        metadata: {
          duration: Date.now() - startTime,
          timestamp: Date.now()
        }
      });

      if (enhancedAnalysis.score > 0.8) {
        this.memory.storeLong({
          type: 'fact',
          content: sanitizedInput,
          response,
          timestamp: Date.now(),
          highlights: highlights,
          sessionId: sessionId
        });
        Logger.debug('[NeuroOrchestrator] Stored in long-term memory');
      }

      // Update state
      Logger.debug('[NeuroOrchestrator] Completing orchestration');
      this._setState('success', { message: 'Complete' });
      
      // Performance monitoring: Complete
      const totalDuration = this.memory.monitor.endTimer('orchestration');
      
      this.emit('complete', {
        response,
        confidence: enhancedAnalysis.score,
        usedVision: !!imageData,
        highlights: highlights,
        duration: Date.now() - startTime,
        clarification,
        sessionId: sessionId,
        context: enhancedAnalysis,
        performance: {
          totalDuration,
          breakdown: this.memory.monitor.getMetrics().timers
        }
      });

      const result = {
        response,
        confidence: enhancedAnalysis.score,
        usedVision: !!imageData,
        highlights: highlights,
        clarification,
        intent,
        duration: Date.now() - startTime,
        sessionId: sessionId,
        context: enhancedAnalysis,
        performance: {
          totalDuration,
          breakdown: this.memory.monitor.getMetrics().timers
        }
      };
      Logger.debug('[NeuroOrchestrator] Orchestration complete');
      
      // Developer tools: Record completion
      if (this.developerTools.recorder) {
        this.developerTools.recorder.recordInteraction('orchestration_complete', {
          sessionId,
          duration: result.duration,
          confidence: result.confidence,
          usedVision: result.usedVision
        });
      }
      
      // Hide overlay after completion
      if (this.ui && highlights.length > 0) {
        setTimeout(() => {
          this.ui.hideOverlay();
          Logger.debug('[NeuroOrchestrator] Overlay hidden');
        }, 2000);
      }
      
      // Performance optimization check
      this.memory.optimize();
      
      return result;

    } catch (error) {
      console.error('[NeuroOrchestrator] Orchestration failed:', error);
      this._setState('error', { message: error.message });
      this.emit('error', error);
      
      // Performance monitoring: Error
      this.memory.monitor.endTimer('orchestration');
      
      throw new NeuroError(
        error.message,
        error.code || 'ORCHESTRATOR_ERROR',
        error
      );
    } finally {
      this.isProcessing = false;
      Logger.debug('[NeuroOrchestrator] Processing flag reset');
    }
  }

  // Helper methods
  _setState(state, data = {}) {
    this.state = state;
    if (this.ui) {
      this.ui.setState(state, data);
    }
  }

  _generateQuestion(input, analysis, intent) {
    if (intent.includes('bug')) {
      return 'Can you describe the error in more detail?';
    }
    if (analysis.score < 0.4) {
      return 'I need more context. What exactly do you need?';
    }
    if (input.includes('?')) {
      return 'Are you asking about a specific problem?';
    }
    return 'Do you need clarification on something?';
  }

  _generateQuestionWithHighlights(input, analysis, intent, highlights) {
    const baseQuestion = this._generateQuestion(input, analysis, intent);
    
    if (highlights && highlights.length > 0) {
      const errorHighlights = highlights.filter(h => h.label && h.label.includes('Error'));
      if (errorHighlights.length > 0) {
        return `I detected ${errorHighlights.length} error indicators on your screen. Can you describe what you're seeing?`;
      }
      
      const textHighlights = highlights.filter(h => h.label && h.label.includes('Text'));
      if (textHighlights.length > 0) {
        return `I found ${textHighlights.length} text regions that might be relevant. Can you describe the issue you're experiencing?`;
      }
    }
    
    return baseQuestion;
  }

  _generateQuestionWithContext(input, enhancedAnalysis, sessionId) {
    const { conversationContext, userPreferences, relevantContext, score, intent } = enhancedAnalysis;
    
    // Check conversation history
    if (conversationContext.messages && conversationContext.messages.length > 0) {
      const lastMessage = conversationContext.messages[conversationContext.messages.length - 1];
      if (lastMessage.type === 'clarification') {
        return `Following up on your previous answer: ${lastMessage.answer}. Can you provide more details about what you're trying to accomplish?`;
      }
    }
    
    // Check user preferences
    if (userPreferences.interaction_type === 'learning') {
      return `I notice you prefer learning explanations. Would you like a detailed breakdown of this issue?`;
    }
    
    // Check temporal context
    const timeOfDay = this.memory.getContext('time_of_day');
    if (timeOfDay === 'evening' && userPreferences.interaction_type === 'problem_solving') {
      return `It's ${timeOfDay}. Are you working on a specific problem you'd like help with?`;
    }
    
    // Check for entities
    const emailEntity = this.memory.getContextByTags(['entity_email']);
    if (emailEntity.length > 0) {
      return `I noticed you mentioned ${emailEntity[0].value}. Is this related to your current issue?`;
    }
    
    // Use enhanced intent-based questions
    if (intent.includes('bug')) {
      return `Based on our conversation history, can you describe the error you're encountering in more detail?`;
    }
    
    if (score < 0.4) {
      return `I need more context to help you effectively. What specific outcome are you looking for?`;
    }
    
    // Default with context awareness
    return `How can I assist you with this? (Session: ${sessionId})`;
  }

  _generateOptions(intent) {
    if (intent.includes('bug')) {
      return ['Error message', 'Expected behavior', 'Steps to reproduce', 'Other'];
    }
    if (intent.includes('explain')) {
      return ['Simple explanation', 'Detailed explanation', 'Examples', 'Other'];
    }
    return ['Yes', 'No', 'More details', 'Other'];
  }

  async _generateResponse(data) {
    Logger.debug('[NeuroOrchestrator] Generating response with data', {
      input: typeof data.input === 'string' ? data.input.substring(0, 50) : null,
      clarification: Boolean(data.clarification),
      hasVision: !!data.imageData,
      hasHighlights: !!data.highlights,
      confidence: data.analysis?.score ?? null,
      intent: data.intent,
      sessionId: data.sessionId
    });
    
    // Placeholder for actual AI response generation
    // In a real implementation, this would call an AI API
    
    const { input, clarification, analysis, intent, highlights, sessionId } = data;
    
    let response = `Based on your input: "${input}"`;
    
    if (clarification) {
      response += `\nWith clarification: "${clarification}"`;
    }
    
    response += `\nConfidence: ${(analysis.score * 100).toFixed(1)}%`;
    response += `\nIntent: ${intent.join(', ')}`;
    
    // Add context-aware information
    if (analysis.conversationContext && analysis.conversationContext.messages) {
      const messageCount = analysis.conversationContext.messages.length;
      if (messageCount > 1) {
        response += `\nConversation history: ${messageCount} messages`;
      }
    }
    
    if (analysis.userPreferences && Object.keys(analysis.userPreferences).length > 0) {
      response += `\nPreferences detected: ${Object.keys(analysis.userPreferences).length}`;
    }
    
    if (data.imageData) {
      response += `\nVision: Image captured (${data.imageData.length} chars)`;
      if (highlights && highlights.length > 0) {
        response += `\nHighlights detected: ${highlights.length} areas of interest`;
        highlights.forEach((hl, index) => {
          response += `\n  ${index + 1}. ${hl.label || 'Highlighted area'} at (${hl.x}, ${hl.y})`;
        });
      }
    }

    // Simulate async processing
    await new Promise(resolve => setTimeout(resolve, 100));

    Logger.debug('[NeuroOrchestrator] Response generated successfully');
    return response;
  }

  // Public API methods
  getMemory() {
    return this.memory.load();
  }

  getStats() {
    return {
      memory: this.memory.getStats(),
      state: this.state,
      isProcessing: this.isProcessing
    };
  }

  clearMemory(type = 'all') {
    switch (type) {
      case 'short':
        this.memory.clearShort();
        break;
      case 'long':
        this.memory.clearLong();
        break;
      case 'user':
        this.memory.clearUser();
        break;
      case 'all':
      default:
        this.memory.clearShort();
        this.memory.clearLong();
        this.memory.clearUser();
        break;
    }
    this.emit('memoryCleared', { type });
  }

  setMemory(key, value) {
    try {
      this.memory.storeUser(key, value);
      this.emit('memoryUpdated', { key, value });
      return true;
    } catch (error) {
      this.emit('memoryUpdateFailed', error);
      return false;
    }
  }

  destroy() {
    if (this.ui) {
      this.ui.destroy();
    }
    this.removeAllListeners();
    this.clearMemory('all');
    this.emit('destroyed');
  }

  // Static factory methods
  static create(container, options = {}) {
    return new NeuroOrchestrator(container, options);
  }

  static validateConfig(config) {
    const errors = [];
    
    if (config.memoryConfig?.maxShort < 10) {
      errors.push('maxShort must be at least 10');
    }
    
    if (config.safetyConfig?.maxInputLength > 50000) {
      errors.push('maxInputLength too large');
    }
    
    return {
      valid: errors.length === 0,
      errors
    };
  }

  // Developer Experience Methods
  enableDebug(options = {}) {
    this.developerTools.enableDebug(true);
    this.developerTools.setLogLevel(options.logLevel || 'info');
    
    if (options.enableProfiling) {
      this.developerTools.startProfiling();
    }
    
    if (options.enableRecording) {
      this.developerTools.startRecording();
    }
    
    this.developerTools.openDebugConsole();
    this.emit('debugEnabled', options);
  }

  disableDebug() {
    this.developerTools.enableDebug(false);
    this.emit('debugDisabled');
  }

  getDebugInfo() {
    return {
      timestamp: Date.now(),
      orchestrator: {
        state: this.state,
        isProcessing: this.isProcessing,
        config: this.config
      },
      memory: this.memory.getMemoryAnalytics(),
      ui: this.ui ? {
        state: this.ui.state,
        hasAnimations: !!this.ui.currentAnimation
      } : null,
      safety: {
        blockedPatterns: this.safety.config.blockedPatterns.length,
        maxInputLength: this.safety.config.maxInputLength
      },
      developerTools: {
        debugMode: this.developerTools.debugMode,
        logLevel: this.developerTools.logLevel,
        hasProfiler: !!this.developerTools.profiler,
        hasRecorder: !!this.developerTools.recorder
      }
    };
  }

  exportDebugData() {
    return this.developerTools.exportDebugData();
  }

  runHealthCheck() {
    return this.developerTools.healthCheck();
  }

  analyzePerformance() {
    const profiler = this.developerTools.profiler;
    if (!profiler) {
      this.developerTools.startProfiling();
      return { message: 'Profiler started. Call stopProfiling() to get results.' };
    }
    
    return profiler.stop();
  }

  startRecording() {
    this.developerTools.startRecording();
    this.emit('recordingStarted');
  }

  stopRecording() {
    const recording = this.developerTools.stopRecording();
    this.emit('recordingStopped', recording);
    return recording;
  }

  clearDebugData() {
    if (this.developerTools.profiler) {
      this.developerTools.profiler.logs = [];
      this.developerTools.profiler.sessions.clear();
    }
    
    if (this.developerTools.recorder) {
      this.developerTools.recorder.interactions = [];
    }
    
    this.emit('debugDataCleared');
  }

  // Advanced debugging methods
  traceMemoryUsage() {
    const trace = {
      timestamp: Date.now(),
      memory: this.memory.getStats(),
      context: {
        size: this.memory.context.size,
        keys: Array.from(this.memory.context.keys())
      },
      conversations: {
        count: this.memory.conversations.size,
        sessions: Array.from(this.memory.conversations.keys())
      },
      preferences: {
        count: this.memory.preferences.size,
        keys: Array.from(this.memory.preferences.keys())
      }
    };
    
    this.developerTools.log('debug', 'Memory trace', trace);
    return trace;
  }

  traceInputProcessing(input) {
    const trace = {
      input: input,
      sanitized: this.safety.sanitize(input),
      validation: this.safety.validate(input),
      analysis: BrainRules.estimateConfidence(input, this.memory.load()),
      intent: BrainRules.extractIntent(input)
    };
    
    this.developerTools.log('debug', 'Input processing trace', trace);
    return trace;
  }

  simulateError(errorType = 'validation') {
    const errors = {
      validation: new ValidationError('Simulated validation error'),
      security: new SecurityError('Simulated security error'),
      memory: new NeuroError('Simulated memory error', 'MEMORY_ERROR'),
      general: new Error('Simulated general error')
    };
    
    const error = errors[errorType] || errors.general;
    this.developerTools.log('error', `Simulated ${errorType} error`, error);
    this.emit('error', error);
    
    return error;
  }

  // Performance monitoring
  monitorPerformance(duration = 60000) {
    const startTime = Date.now();
    const interval = setInterval(() => {
      const elapsed = Date.now() - startTime;
      if (elapsed >= duration) {
        clearInterval(interval);
        this.emit('performanceMonitoringStopped');
        return;
      }
      
      const stats = this.memory.getMemoryAnalytics();
      this.emit('performanceUpdate', {
        elapsed,
        memoryStats: stats,
        state: this.state
      });
    }, 5000); // Update every 5 seconds
    
    this.emit('performanceMonitoringStarted', { duration });
    return interval;
  }

  // Configuration management
  updateConfig(newConfig) {
    const oldConfig = { ...this.config };
    this.config = { ...this.config, ...newConfig };
    
    // Apply new memory config
    if (newConfig.memoryConfig) {
      this.memory.config = { ...this.memory.config, ...newConfig.memoryConfig };
    }
    
    // Apply new safety config
    if (newConfig.safetyConfig) {
      this.safety.config = { ...this.safety.config, ...newConfig.safetyConfig };
    }
    
    // Apply new UI config
    if (newConfig.uiConfig && this.ui) {
      this.ui.config = { ...this.ui.config, ...newConfig.uiConfig };
    }
    
    this.emit('configUpdated', { oldConfig, newConfig });
    return this.config;
  }

  resetConfig() {
    this.config = {
      autoInit: true,
      enableAnimations: true,
      enableVision: true,
      enableDebug: false,
      enableProfiling: false,
      enableRecording: false,
      memoryConfig: {},
      safetyConfig: {},
      uiConfig: {}
    };
    
    this.emit('configReset', this.config);
    return this.config;
  }

  // Utility methods for developers
  createTestSession() {
    const sessionId = `test_session_${Date.now()}`;
    this.memory.storeConversation(sessionId, {
      input: 'Test input',
      response: 'Test response',
      intent: ['test'],
      confidence: 0.9
    }, {
      context: { test: true },
      metadata: { testSession: true }
    });
    
    this.emit('testSessionCreated', { sessionId });
    return sessionId;
  }

  benchmarkSearch(queries = ['test', 'hello', 'error', 'help']) {
    const results = [];
    
    queries.forEach(query => {
      const start = performance.now();
      const searchResults = this.memory.semanticSearch(query, { limit: 10 });
      const end = performance.now();
      
      results.push({
        query,
        duration: end - start,
        results: searchResults.length
      });
    });
    
    const totalDuration = results.reduce((sum, r) => sum + r.duration, 0);
    const avgDuration = totalDuration / results.length;
    
    this.emit('benchmarkCompleted', {
      results,
      totalDuration,
      avgDuration,
      queries: queries.length
    });
    
    return {
      results,
      totalDuration,
      avgDuration
    };
  }
}

// ----------------- EXPORTS -----------------
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    NeuroOrchestrator,
    MemoryManager,
    SafetyEngine,
    BrainRules,
    UIManager,
    VisionEngine,
    EventEmitter,
    NeuroError,
    SecurityError,
    ValidationError,
    // New classes for enhanced features
    PerformanceCache,
    PerformanceMonitor,
    DeveloperTools,
    PerformanceProfiler,
    InteractionRecorder
  };
}

// Browser global - expose a single namespace to avoid global pollution
if (typeof window !== 'undefined') {
  (function(){
    const previous = window.Neuro || null;
    const Neuro = window.Neuro = window.Neuro || {};

    // Main entry point
    Neuro.Orchestrator = Neuro.Orchestrator || NeuroOrchestrator;

    // Optionally expose helpers under a tools object to reduce global names
    Neuro.tools = Object.assign(Neuro.tools || {}, {
      MemoryManager,
      SafetyEngine,
      BrainRules,
      UIManager,
      VisionEngine,
      EventEmitter,
      NeuroError,
      SecurityError,
      ValidationError,
      PerformanceCache,
      PerformanceMonitor,
      DeveloperTools,
      PerformanceProfiler,
      InteractionRecorder
    });

    // noConflict restores previous window.Neuro
    Neuro.noConflict = function() {
      if (previous === null) {
        delete window.Neuro;
      } else {
        window.Neuro = previous;
      }
      return Neuro;
    };
  })();
}

// ----------------- QUICK VALIDATION -----------------
class QuickValidator {
  static validateEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return {
      valid: emailRegex.test(email),
      value: email,
      type: 'email'
    };
  }

  static validateURL(url) {
    try {
      const urlObj = new URL(url);
      return {
        valid: ['http:', 'https:'].includes(urlObj.protocol),
        value: url,
        type: 'url',
        protocol: urlObj.protocol.replace(':', ''),
        domain: urlObj.hostname
      };
    } catch (e) {
      return {
        valid: false,
        value: url,
        type: 'url',
        error: e.message
      };
    }
  }

  static validateJSON(jsonString) {
    try {
      const parsed = JSON.parse(jsonString);
      return {
        valid: true,
        value: parsed,
        type: 'json',
        length: jsonString.length
      };
    } catch (e) {
      return {
        valid: false,
        value: jsonString,
        type: 'json',
        error: e.message
      };
    }
  }

  static validateOutput(value, type) {
    switch (type.toLowerCase()) {
      case 'email':
        return this.validateEmail(value);
      case 'url':
        return this.validateURL(value);
      case 'json':
        return this.validateJSON(value);
      default:
        return {
          valid: false,
          value: value,
          type: type,
          error: `Unknown validation type: ${type}`
        };
    }
  }

  static validateMultiple(outputs) {
    const results = {};
    for (const [key, { value, type }] of Object.entries(outputs)) {
      results[key] = this.validateOutput(value, type);
    }
    return results;
  }
}

// ----------------- BATCH PROCESSING -----------------
class BatchProcessor {
  constructor(orchestrator, options = {}) {
    this.orchestrator = orchestrator;
    this.options = {
      batchSize: 5,
      concurrency: 3,
      retryAttempts: 2,
      delayBetweenBatches: 1000,
      ...options
    };
    this.batchId = null;
    this.results = [];
    this.errors = [];
    this.processing = false;
  }

  async processBatch(tasks, options = {}) {
    const config = { ...this.options, ...options };
    this.batchId = `batch_${Date.now()}`;
    this.results = [];
    this.errors = [];
    this.processing = true;

    Logger.debug(`[BatchProcessor] Starting batch ${this.batchId} with ${tasks.length} tasks`);
    this.orchestrator.emit('batchStarted', {
      batchId: this.batchId,
      taskCount: tasks.length,
      config
    });

    try {
      const batches = this._createBatches(tasks, config.batchSize);
      let batchIndex = 0;

      for (const batch of batches) {
        batchIndex++;
        Logger.debug(`[BatchProcessor] Processing batch ${batchIndex}/${batches.length}`);
        
        const batchResults = await this._processBatch(batch, config);
        this.results.push(...batchResults.completed);
        this.errors.push(...batchResults.failed);

        if (batchIndex < batches.length && config.delayBetweenBatches > 0) {
          await this._delay(config.delayBetweenBatches);
        }
      }

      const summary = {
        batchId: this.batchId,
        totalTasks: tasks.length,
        completed: this.results.length,
        failed: this.errors.length,
        successRate: ((this.results.length / tasks.length) * 100).toFixed(2) + '%'
      };

      this.orchestrator.emit('batchCompleted', summary);
      Logger.debug(`[BatchProcessor] Batch ${this.batchId} completed`);

      return {
        batchId: this.batchId,
        results: this.results,
        errors: this.errors,
        summary
      };

    } catch (error) {
      console.error(`[BatchProcessor] Batch ${this.batchId} failed:`, error);
      this.orchestrator.emit('batchFailed', { batchId: this.batchId, error });
      throw error;
    } finally {
      this.processing = false;
    }
  }

  async _processBatch(batch, config) {
    const results = { completed: [], failed: [] };
    const semaphore = new Semaphore(config.concurrency);

    const promises = batch.map(async (task, index) => {
      await semaphore.acquire();
      
      try {
        const result = await this._executeTask(task, config);
        results.completed.push({
          index,
          task,
          result,
          timestamp: Date.now()
        });
      } catch (error) {
        results.failed.push({
          index,
          task,
          error: error.message,
          timestamp: Date.now()
        });
      } finally {
        semaphore.release();
      }
    });

    await Promise.all(promises);
    return results;
  }

  async _executeTask(task, config) {
    let attempts = 0;
    
    while (attempts <= config.retryAttempts) {
      try {
        // Check if agent is paused
        if (this.orchestrator.agentController && this.orchestrator.agentController.isPaused()) {
          await this.orchestrator.agentController.waitForResume();
        }

        const result = await this.orchestrator.orchestrate(task.input, task.context);
        return result;
      } catch (error) {
        attempts++;
        if (attempts > config.retryAttempts) {
          throw error;
        }
        
        console.warn(`[BatchProcessor] Task failed (attempt ${attempts}), retrying...`, error.message);
        await this._delay(1000 * attempts); // Exponential backoff
      }
    }
  }

  _createBatches(tasks, batchSize) {
    const batches = [];
    for (let i = 0; i < tasks.length; i += batchSize) {
      batches.push(tasks.slice(i, i + batchSize));
    }
    return batches;
  }

  _delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  getBatchStatus() {
    return {
      batchId: this.batchId,
      processing: this.processing,
      resultsCount: this.results.length,
      errorsCount: this.errors.length,
      results: this.results,
      errors: this.errors
    };
  }

  cancelBatch() {
    if (!this.processing) {
      Logger.debug('[BatchProcessor] No active batch to cancel');
      return false;
    }
    
    this.processing = false;
    this.orchestrator.emit('batchCancelled', { batchId: this.batchId });
    console.log(`[BatchProcessor] Batch ${this.batchId} cancelled`);
    return true;
  }
}

class Semaphore {
  constructor(maxConcurrency) {
    this.maxConcurrency = maxConcurrency;
    this.currentConcurrency = 0;
    this.waitQueue = [];
  }

  async acquire() {
    if (this.currentConcurrency < this.maxConcurrency) {
      this.currentConcurrency++;
      return;
    }

    return new Promise(resolve => {
      this.waitQueue.push(resolve);
    });
  }

  release() {
    this.currentConcurrency--;
    
    if (this.waitQueue.length > 0) {
      const resolve = this.waitQueue.shift();
      this.currentConcurrency++;
      resolve();
    }
  }
}

// ----------------- STREAMING RESPONSES -----------------
class StreamingResponse {
  constructor(orchestrator, options = {}) {
    this.orchestrator = orchestrator;
    this.options = {
      chunkSize: 100,
      delay: 50,
      enableBuffering: true,
      bufferSize: 500,
      ...options
    };
    this.buffer = '';
    this.isStreaming = false;
    this.streamId = null;
    this.onStream = options.onStream || null;
  }

  async streamResponse(input, context = {}) {
    this.streamId = `stream_${Date.now()}`;
    this.isStreaming = true;
    this.buffer = '';
    
    console.log(`[StreamingResponse] Starting stream ${this.streamId}`);
    this.orchestrator.emit('streamStarted', { streamId: this.streamId, input });

    try {
      // Generate response chunks
      const response = await this.orchestrator.orchestrate(input, context);
      const chunks = this._createChunks(response.response || response);
      
      for (let i = 0; i < chunks.length; i++) {
        const chunk = chunks[i];
        this.buffer += chunk;
        
        const chunkData = {
          streamId: this.streamId,
          chunkIndex: i,
          chunk: chunk,
          buffer: this.options.enableBuffering ? this.buffer : null,
          totalChunks: chunks.length,
          completed: i === chunks.length - 1,
          timestamp: Date.now()
        };

        // Emit stream event
        if (this.onStream) {
          this.onStream(chunkData);
        }
        this.orchestrator.emit('streamChunk', chunkData);

        // Delay between chunks
        if (i < chunks.length - 1) {
          await this._delay(this.options.delay);
        }
      }

      const finalData = {
        streamId: this.streamId,
        finalResponse: response,
        buffer: this.buffer,
        totalChunks: chunks.length,
        timestamp: Date.now()
      };

      this.orchestrator.emit('streamCompleted', finalData);
      console.log(`[StreamingResponse] Stream ${this.streamId} completed`);

      return {
        streamId: this.streamId,
        finalResponse: response,
        buffer: this.buffer,
        chunks: chunks.length
      };

    } catch (error) {
      console.error(`[StreamingResponse] Stream ${this.streamId} failed:`, error);
      this.orchestrator.emit('streamFailed', { streamId: this.streamId, error });
      throw error;
    } finally {
      this.isStreaming = false;
    }
  }

  _createChunks(text, chunkSize = this.options.chunkSize) {
    const chunks = [];
    for (let i = 0; i < text.length; i += chunkSize) {
      chunks.push(text.slice(i, i + chunkSize));
    }
    return chunks;
  }

  _delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  getStreamStatus() {
    return {
      streamId: this.streamId,
      isStreaming: this.isStreaming,
      bufferLength: this.buffer.length,
      bufferSize: this.options.bufferSize
    };
  }

  cancelStream() {
    if (!this.isStreaming) {
      console.log('[StreamingResponse] No active stream to cancel');
      return false;
    }
    
    this.isStreaming = false;
    this.buffer = '';
    this.orchestrator.emit('streamCancelled', { streamId: this.streamId });
    console.log(`[StreamingResponse] Stream ${this.streamId} cancelled`);
    return true;
  }
}

// ----------------- ENHANCED NEURO ORCHESTRATOR -----------------
// Extend the existing NeuroOrchestrator class with new features

// Store original constructor
const OriginalNeuroOrchestrator = NeuroOrchestrator;

// Enhanced constructor
function EnhancedNeuroOrchestrator(container, options = {}) {
  // Call original constructor
  OriginalNeuroOrchestrator.call(this, container, options);
  
  // Initialize new features
  this.agentController = new AgentController(this);
  this.batchProcessor = new BatchProcessor(this, options.batchConfig || {});
  this.streamingResponse = new StreamingResponse(this, options.streamingConfig || {});
  
  // Enhanced configuration
  this.config = {
    ...this.config,
    batchConfig: options.batchConfig || {},
    streamingConfig: options.streamingConfig || {},
    validationConfig: options.validationConfig || {},
    pauseResumeConfig: options.pauseResumeConfig || {}
  };
  
  Logger.debug('[EnhancedNeuroOrchestrator] Enhanced features initialized');
}

// Inherit from original
EnhancedNeuroOrchestrator.prototype = Object.create(OriginalNeuroOrchestrator.prototype);
EnhancedNeuroOrchestrator.prototype.constructor = EnhancedNeuroOrchestrator;

// Add new methods to EnhancedNeuroOrchestrator prototype

// Agent Pause/Resume methods
EnhancedNeuroOrchestrator.prototype.pause = function() {
  this.agentController.pause();
};

EnhancedNeuroOrchestrator.prototype.resume = function() {
  this.agentController.resume();
};

EnhancedNeuroOrchestrator.prototype.isPaused = function() {
  return this.agentController.isPaused();
};

EnhancedNeuroOrchestrator.prototype.getPauseStatus = function() {
  return this.agentController.getQueueStatus();
};

// Quick Validation methods
EnhancedNeuroOrchestrator.prototype.validateOutput = function(value, type) {
  return QuickValidator.validateOutput(value, type);
};

EnhancedNeuroOrchestrator.prototype.validateMultipleOutputs = function(outputs) {
  return QuickValidator.validateMultiple(outputs);
};

EnhancedNeuroOrchestrator.prototype.validateEmail = function(email) {
  return QuickValidator.validateEmail(email);
};

EnhancedNeuroOrchestrator.prototype.validateURL = function(url) {
  return QuickValidator.validateURL(url);
};

EnhancedNeuroOrchestrator.prototype.validateJSON = function(jsonString) {
  return QuickValidator.validateJSON(jsonString);
};

// Batch Processing methods
EnhancedNeuroOrchestrator.prototype.processBatch = function(tasks, options = {}) {
  return this.batchProcessor.processBatch(tasks, options);
};

EnhancedNeuroOrchestrator.prototype.getBatchStatus = function() {
  return this.batchProcessor.getBatchStatus();
};

EnhancedNeuroOrchestrator.prototype.cancelBatch = function() {
  return this.batchProcessor.cancelBatch();
};

// Streaming Response methods
EnhancedNeuroOrchestrator.prototype.streamResponse = function(input, context = {}, options = {}) {
  const streamingConfig = { ...this.config.streamingConfig, ...options };
  const streamingResponse = new StreamingResponse(this, streamingConfig);
  return streamingResponse.streamResponse(input, context);
};

EnhancedNeuroOrchestrator.prototype.getStreamStatus = function() {
  return this.streamingResponse.getStreamStatus();
};

EnhancedNeuroOrchestrator.prototype.cancelStream = function() {
  return this.streamingResponse.cancelStream();
};

// Enhanced orchestrate method with pause/resume support
EnhancedNeuroOrchestrator.prototype.orchestrate = async function(input, context = {}) {
  // Check if paused before starting
  if (this.agentController.isPaused()) {
    Logger.debug('[EnhancedNeuroOrchestrator] Task queued due to pause');
    await this.agentController.waitForResume();
  }

  // Call original orchestrate method
  return await OriginalNeuroOrchestrator.prototype.orchestrate.call(this, input, context);
};

// Factory method for enhanced orchestrator
EnhancedNeuroOrchestrator.create = function(container, options = {}) {
  return new EnhancedNeuroOrchestrator(container, options);
};

// ----------------- EXPORTS -----------------
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    NeuroOrchestrator: EnhancedNeuroOrchestrator,
    MemoryManager,
    SafetyEngine,
    BrainRules,
    UIManager,
    VisionEngine,
    EventEmitter,
    NeuroError,
    SecurityError,
    ValidationError,
    // New classes for enhanced features
    PerformanceCache,
    PerformanceMonitor,
    DeveloperTools,
    PerformanceProfiler,
    InteractionRecorder,
    // New feature classes
    AgentController,
    QuickValidator,
    BatchProcessor,
    StreamingResponse,
    Semaphore
  };
}

// Browser global: attach enhanced orchestrator to the Neuro namespace
if (typeof window !== 'undefined') {
  (function(){
    const Neuro = window.Neuro = window.Neuro || {};
    Neuro.EnhancedOrchestrator = Neuro.EnhancedOrchestrator || EnhancedNeuroOrchestrator;
    Neuro.tools = Object.assign(Neuro.tools || {}, {
      MemoryManager,
      SafetyEngine,
      BrainRules,
      UIManager,
      VisionEngine,
      EventEmitter,
      NeuroError,
      SecurityError,
      ValidationError,
      PerformanceCache,
      PerformanceMonitor,
      DeveloperTools,
      PerformanceProfiler,
      InteractionRecorder,
      AgentController,
      QuickValidator,
      BatchProcessor,
      StreamingResponse,
      Semaphore
    });
  })();
}
