import { Injectable } from '@angular/core';
import { AppConfig } from '@src/app/constants/appConfig';
import { Subject } from 'rxjs';
import { io } from 'socket.io-client';
import { NotificationService } from '../notification/notification.service';

@Injectable({
	providedIn: 'root'
})
export class AppSocketService {

	constructor(
		private _appConfig: AppConfig,
		private _notificationService: NotificationService
	) { }

	private appSocket: any;
	public isConnected = false;
	private canvasUsers = new Subject<any>();
	public canvasUsers$ = this.canvasUsers.asObservable();

	private liveEditing = new Subject<any>();
	public liveEditing$ = this.liveEditing.asObservable();

	private canvasDataUpdated = new Subject<any>();
	public canvasDataUpdated$ = this.canvasDataUpdated.asObservable();

	private editAccess = new Subject<any>();
	public editAccess$ = this.editAccess.asObservable();

	establishSocketConnection() {
		if (this.isConnected) return;

		this.appSocket = io(this._appConfig.serverURL);
		this.appSocket.on('connect', () => {
			this.isConnected = true;
		});
	}

	joinUserRoom(roomId: string) {
		this.appSocket.emit('join-user-room', { rooms: roomId });
		this.appSocket.on('new-notification', (data: any) => {
			this._notificationService.receivedNotification(data);
		});
	}

	leaveUserRoom(roomId: string) {
		this.appSocket.emit('leave-user-room', { rooms: roomId });
	}

	joinCanvasRoom(roomId: string) {
		this.appSocket.emit('join', { rooms: roomId });
		this.appSocket.on('canvas-user-joined', (data: any) => {
			this.canvasUsers.next(data);
		});
		this.appSocket.on('canvas-user-removed', (data: any) => {
			this.canvasUsers.next(data);
		});
		this.appSocket.on('requirement-editing-started', (data: any) => {
			this.liveEditing.next(data);
		});
		this.appSocket.on('requirement-editing-ended', (data: any) => {
			this.liveEditing.next(data);
		});
		this.appSocket.on('canvas-data-updated', (data: any) => {
			this.canvasDataUpdated.next(data);
		});
		this.appSocket.on('edit-access-approved', (data: any) => {
			this.editAccess.next(data);
		});
	}

	leaveCanvasRoom(roomId: string) {
		this.appSocket.emit('leave', { rooms: roomId });
	}

	emitUserJoin(data: any) {
		this.appSocket.emit('user-join', data);
	}
	emitUserRemove(data: any) {
		this.appSocket.emit('user-remove', data);
	}
	emitStartRequirementEditing(data: any) {
		this.appSocket.emit('start-requirement-editing', data);
	}
	emitEndRequirementEditing(data: any) {
		this.appSocket.emit('end-requirement-editing', data);
	}

	disconnectSocketConnection() {
		if (this.appSocket) {
			this.appSocket.close();
			this.isConnected = false;
		}
	}

}
