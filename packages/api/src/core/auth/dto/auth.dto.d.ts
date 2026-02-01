export declare class LoginDto {
    email: string;
    password: string;
    organizationId?: string;
}
export declare class RegisterDto {
    email: string;
    password: string;
    firstName: string;
    lastName: string;
    organizationName?: string;
}
export declare class RefreshTokenDto {
    refreshToken: string;
}
export declare class SwitchOrganizationDto {
    organizationId: string;
}
export declare class ChangePasswordDto {
    currentPassword: string;
    newPassword: string;
}
export declare class ForgotPasswordDto {
    email: string;
}
export declare class ResetPasswordDto {
    token: string;
    password: string;
}
//# sourceMappingURL=auth.dto.d.ts.map