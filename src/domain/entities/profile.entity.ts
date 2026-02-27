export class Profile {
  constructor(
    public readonly id: string,
    public readonly email: string | null,
    public readonly name: string | null,
    public readonly nickname: string | null,
    public readonly avatarUrl: string | null,
    public readonly role: string,
    public readonly createdAt: Date,
    public readonly updatedAt: Date,
  ) {}
}
