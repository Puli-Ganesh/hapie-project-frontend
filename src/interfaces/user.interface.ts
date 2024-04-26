export interface IOTPDetails {
	OTP?: number,
	expiresAt?: Date
}

export interface IUser {
	_id?: string,
	email?: string,
	password?: string,
	firstName: string,
	lastName: string,
	type?: number,
	profilePicture?: string,
	signedProfilePicture?: string,
	isInvited?: boolean,
	resetPasswordToken?: string,
	resetTokenTime?: Date,
	lastSuccessfullyVerifiedAt?: Date,
	OTPDetails?: IOTPDetails,
	isDeleted?: boolean,
	isSSOLogin?: boolean
}
