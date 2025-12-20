export type AddTeamCommandProps = {
  id: string;
  name: string;
  description: string;
}

export class AddTeamCommand {
  constructor(public readonly props: AddTeamCommandProps) {
  }
}
