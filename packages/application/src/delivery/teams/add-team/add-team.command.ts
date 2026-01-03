export type AddTeamCommandProps = {
  id: string;
  name: string;
}

export class AddTeamCommand {
  constructor(public readonly props: AddTeamCommandProps) {
  }
}
