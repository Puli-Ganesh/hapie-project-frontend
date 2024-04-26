import { Injectable } from '@angular/core';

export interface IModal {
  id: string
  open: boolean
}

@Injectable({
  providedIn: 'root'
})
export class ModalService {

  modals: Array<IModal> = [];

  registerModal(id: string) {
    const index = this.modals.findIndex((m: IModal) => m.id === id);
    if (index == -1) {
      this.modals.push({
        id: id,
        open: false
      });
    }
  }

  unregisterModal(id: string) {
    this.modals = this.modals.filter((m: IModal) => m.id !== id);
  }

  isModalVisible(id: string): boolean {
    const modal = this.modals.find((m: IModal) => m.id === id);
    if (modal) {
      return modal.open;
    }
    return false;
  }

  openModal(id: string) {
    const index = this.modals.findIndex((m: IModal) => m.id === id);
    if (index > -1) {
      this.modals[index].open = true;
    }
  }

  closeModal(id: string) {
    const index = this.modals.findIndex((m: IModal) => m.id === id);
    if (index > -1) {
      this.modals[index].open = false;
    }
  }

  toggleModal(id: string) {
    const index = this.modals.findIndex((m: IModal) => m.id === id);
    if (index > -1) {
      this.modals[index].open = !this.modals[index].open;
    }
  }
}
