// API Client for Backend Services - Production Ready

import { APIResponse, PaginatedResponse, GovernanceError } from '@/app/types';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';
const API_TIMEOUT = 30000; // 30 seconds

export class APIClient {
  private baseURL: string;
  private timeout: number;
  private authToken: string | null = null;

  constructor(baseURL: string = API_BASE_URL, timeout: number = API_TIMEOUT) {
    this.baseURL = baseURL;
    this.timeout = timeout;
  }

  setAuthToken(token: string) {
    this.authToken = token;
  }

  clearAuthToken() {
    this.authToken = null;
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<APIResponse<T>> {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), this.timeout);

    try {
      const headers: HeadersInit = {
        'Content-Type': 'application/json',
        ...options.headers,
      };

      if (this.authToken) {
        headers['Authorization'] = `Bearer ${this.authToken}`;
      }

      const response = await fetch(`${this.baseURL}${endpoint}`, {
        ...options,
        headers,
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      const data = await response.json();

      if (!response.ok) {
        throw new GovernanceError(
          data.error?.code || 'API_ERROR',
          data.error?.message || 'API request failed',
          data.error?.details
        );
      }

      return data;
    } catch (error: any) {
      clearTimeout(timeoutId);

      if (error.name === 'AbortError') {
        throw new GovernanceError('TIMEOUT', 'Request timeout');
      }

      if (error instanceof GovernanceError) {
        throw error;
      }

      throw new GovernanceError('NETWORK_ERROR', error.message || 'Network error occurred');
    }
  }

  // AI Services
  async analyzeProposal(proposalData: {
    title: string;
    description: string;
    category: string;
  }): Promise<APIResponse<{
    ethicsScore: number;
    riskScore: number;
    aiRecommendation: {
      score: number;
      reasoning: string;
    };
  }>> {
    return this.request('/ai/analyze-proposal', {
      method: 'POST',
      body: JSON.stringify(proposalData),
    });
  }

  async predictOutcome(proposalId: string): Promise<APIResponse<{
    successProbability: number;
    impactMetrics: any;
    riskFactors: string[];
    confidence: number;
  }>> {
    return this.request(`/ai/predict-outcome/${proposalId}`, {
      method: 'GET',
    });
  }

  async detectThreats(): Promise<APIResponse<{
    threats: any[];
    overallRiskLevel: number;
    recommendations: string[];
  }>> {
    return this.request('/ai/detect-threats', {
      method: 'GET',
    });
  }

  async calculateReputation(address: string): Promise<APIResponse<{
    overall: number;
    votingAccuracy: number;
    expertiseScore: number;
    participationConsistency: number;
    ethicalAlignment: number;
    contributionValue: number;
  }>> {
    return this.request(`/ai/reputation/${address}`, {
      method: 'GET',
    });
  }

  async measureImpact(projectId: string): Promise<APIResponse<{
    metrics: any;
    score: number;
    verified: boolean;
  }>> {
    return this.request(`/ai/measure-impact/${projectId}`, {
      method: 'POST',
    });
  }

  // Reputation Services
  async getReputation(address: string): Promise<APIResponse<any>> {
    return this.request(`/reputation/${address}`, {
      method: 'GET',
    });
  }

  async updateReputation(
    address: string,
    updates: any
  ): Promise<APIResponse<void>> {
    return this.request(`/reputation/${address}`, {
      method: 'PUT',
      body: JSON.stringify(updates),
    });
  }

  async getDomainExperts(domain: string): Promise<APIResponse<any[]>> {
    return this.request(`/reputation/experts/${domain}`, {
      method: 'GET',
    });
  }

  // RPGF Services
  async getRPGFRounds(): Promise<APIResponse<PaginatedResponse<any>>> {
    return this.request('/rpgf/rounds', {
      method: 'GET',
    });
  }

  async submitRPGFProject(projectData: any): Promise<APIResponse<{ projectId: string }>> {
    return this.request('/rpgf/projects', {
      method: 'POST',
      body: JSON.stringify(projectData),
    });
  }

  async attestProjectImpact(
    projectId: string,
    attestation: any
  ): Promise<APIResponse<void>> {
    return this.request(`/rpgf/projects/${projectId}/attest`, {
      method: 'POST',
      body: JSON.stringify(attestation),
    });
  }

  async getProjectAttestations(projectId: string): Promise<APIResponse<any[]>> {
    return this.request(`/rpgf/projects/${projectId}/attestations`, {
      method: 'GET',
    });
  }

  // Optimistic Governance Services
  async getOptimisticProposals(): Promise<APIResponse<PaginatedResponse<any>>> {
    return this.request('/optimistic/proposals', {
      method: 'GET',
    });
  }

  async submitChallenge(
    proposalId: string,
    challengeData: any
  ): Promise<APIResponse<{ challengeId: string }>> {
    return this.request(`/optimistic/proposals/${proposalId}/challenge`, {
      method: 'POST',
      body: JSON.stringify(challengeData),
    });
  }

  async validateChallenge(
    challengeId: string,
    vote: 'valid' | 'invalid'
  ): Promise<APIResponse<void>> {
    return this.request(`/optimistic/challenges/${challengeId}/vote`, {
      method: 'POST',
      body: JSON.stringify({ vote }),
    });
  }

  // ZK Voting Services
  async generateZKProof(voteData: any): Promise<APIResponse<{
    proof: any;
    publicSignals: string[];
  }>> {
    return this.request('/zk/generate-proof', {
      method: 'POST',
      body: JSON.stringify(voteData),
    });
  }

  async verifyZKProof(proof: any): Promise<APIResponse<{ valid: boolean }>> {
    return this.request('/zk/verify-proof', {
      method: 'POST',
      body: JSON.stringify({ proof }),
    });
  }

  // Impact Certificates Services
  async getImpactCertificates(): Promise<APIResponse<PaginatedResponse<any>>> {
    return this.request('/certificates', {
      method: 'GET',
    });
  }

  async getCertificatePrice(certificateId: string): Promise<APIResponse<{
    currentPrice: string;
    priceHistory: any[];
  }>> {
    return this.request(`/certificates/${certificateId}/price`, {
      method: 'GET',
    });
  }

  async getMarketOrders(certificateId: string): Promise<APIResponse<{
    buyOrders: any[];
    sellOrders: any[];
  }>> {
    return this.request(`/certificates/${certificateId}/orders`, {
      method: 'GET',
    });
  }

  // Risk Dashboard Services
  async getThreatDetections(): Promise<APIResponse<any[]>> {
    return this.request('/risk/threats', {
      method: 'GET',
    });
  }

  async getVotingPatterns(): Promise<APIResponse<any[]>> {
    return this.request('/risk/patterns', {
      method: 'GET',
    });
  }

  async getConcentrationRisks(): Promise<APIResponse<any[]>> {
    return this.request('/risk/concentration', {
      method: 'GET',
    });
  }

  async reportSuspiciousActivity(report: any): Promise<APIResponse<void>> {
    return this.request('/risk/report', {
      method: 'POST',
      body: JSON.stringify(report),
    });
  }

  // Governance Metrics
  async getGovernanceMetrics(): Promise<APIResponse<any>> {
    return this.request('/metrics/governance', {
      method: 'GET',
    });
  }

  async getProposalStats(proposalId: string): Promise<APIResponse<any>> {
    return this.request(`/metrics/proposals/${proposalId}`, {
      method: 'GET',
    });
  }

  // Notifications
  async getNotifications(address: string): Promise<APIResponse<any[]>> {
    return this.request(`/notifications/${address}`, {
      method: 'GET',
    });
  }

  async markNotificationRead(notificationId: string): Promise<APIResponse<void>> {
    return this.request(`/notifications/${notificationId}/read`, {
      method: 'PUT',
    });
  }

  // Activity Feed
  async getActivityFeed(
    filters?: {
      type?: string;
      address?: string;
      limit?: number;
      offset?: number;
    }
  ): Promise<APIResponse<PaginatedResponse<any>>> {
    const params = new URLSearchParams();
    if (filters?.type) params.append('type', filters.type);
    if (filters?.address) params.append('address', filters.address);
    if (filters?.limit) params.append('limit', filters.limit.toString());
    if (filters?.offset) params.append('offset', filters.offset.toString());

    return this.request(`/activity?${params.toString()}`, {
      method: 'GET',
    });
  }
}

// Export singleton instance
export const apiClient = new APIClient();

// Utility: Retry failed requests
export async function retryRequest<T>(
  fn: () => Promise<T>,
  maxRetries: number = 3,
  delay: number = 1000
): Promise<T> {
  let lastError: Error | null = null;

  for (let i = 0; i < maxRetries; i++) {
    try {
      return await fn();
    } catch (error: any) {
      lastError = error;
      
      // Don't retry on certain errors
      if (error.code === 'VALIDATION_ERROR' || error.code === 'AUTH_ERROR') {
        throw error;
      }

      if (i < maxRetries - 1) {
        await new Promise(resolve => setTimeout(resolve, delay * (i + 1)));
      }
    }
  }

  throw lastError || new Error('Max retries exceeded');
}

// Utility: Batch requests
export async function batchRequests<T>(
  requests: (() => Promise<T>)[],
  batchSize: number = 5
): Promise<T[]> {
  const results: T[] = [];

  for (let i = 0; i < requests.length; i += batchSize) {
    const batch = requests.slice(i, i + batchSize);
    const batchResults = await Promise.all(batch.map(req => req()));
    results.push(...batchResults);
  }

  return results;
}
