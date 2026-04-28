export class StatusView {
  constructor(container) {
    this.container = container;
  }

  update(message) {
    this.container.textContent = message;
  }

  clear() {
    this.container.textContent = "";
  }
}
