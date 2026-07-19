/**
 * Circuit Breaker Pattern para o Hórus OS
 * Protege o sistema contra falhas em cascata de serviços externos (APIs, LLMs, DB).
 */

export class CircuitBreaker {
  private failureThreshold: number;
  private recoveryTimeout: number;
  private failures: number = 0;
  private state: 'CLOSED' | 'OPEN' | 'HALF_OPEN' = 'CLOSED';
  private nextAttempt: number = Date.now();

  constructor(failureThreshold = 3, recoveryTimeout = 30000) {
    this.failureThreshold = failureThreshold; // Número de falhas antes de abrir o circuito
    this.recoveryTimeout = recoveryTimeout;   // Tempo em ms para tentar fechar novamente
  }

  async execute<T>(action: () => Promise<T>): Promise<T> {
    if (this.state === 'OPEN') {
      if (Date.now() > this.nextAttempt) {
        this.state = 'HALF_OPEN';
      } else {
        throw new Error('[CircuitBreaker] Circuito ABERTO. Bloqueando chamadas para evitar sobrecarga.');
      }
    }

    try {
      const result = await action();
      this.reset();
      return result;
    } catch (error) {
      this.recordFailure();
      throw error;
    }
  }

  private recordFailure() {
    this.failures++;
    if (this.failures >= this.failureThreshold) {
      this.state = 'OPEN';
      this.nextAttempt = Date.now() + this.recoveryTimeout;
      console.warn(`[CircuitBreaker] Circuito ABERTO. Falhas: ${this.failures}`);
    }
  }

  private reset() {
    this.failures = 0;
    this.state = 'CLOSED';
  }
}

// Instâncias globais de proteção
export const geminiCircuitBreaker = new CircuitBreaker(3, 60000); // Mais tolerância para o LLM
export const databaseCircuitBreaker = new CircuitBreaker(5, 10000);
