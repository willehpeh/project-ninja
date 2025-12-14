# Project Ninja
   > _Because Ninja Is Not JirA_

I once met a developer who felt that Jira and Azure DevOps were fit for purpose. __Once.__ 

As far as I can tell, everybody else except management _hates_ Jira and is at best ambivalent about Azure DevOps. I firmly believe that a large part of the
reason for this hatred is that they make _doing the thing right_ exceptionally hard,
and make it far too easy to do things catastrophically wrong. Be it only assigning "tickets" to individuals, estimation (hours or points, pick your poison),
enforcing title formats for work items (I have a client who does this), creating overly complex workflows…
product teams are encouraged to use these "features", utterly destroying what little hope they have left.

I started my IT career as a freelance developer, but slowly but surely I found myself helping my clients figure out their organisational issues.
Increasingly over the past few years, I've found myself longing for a really simple product lifecycle tool. Something that makes it __easy__ to apply
the practices we're all supposed to know are a better way to do things. I also want that tool to
facilitate measuring various metrics, be they DORA-style (lead time alone would be great), Lean (WIP please),
or other, team-selected success metrics, I want it to be __simple__ to measure and track these.

Hence __Project Ninja__, because Ninja Is Not JirA.

This tool is licensed under GPLv3, meaning it's FOSS and no-one (including myself) can ever change that fact. I don't want to steal market share from
Atlassian and Microsoft: I want them to __lose their undeserved cashflow__. Petty? Absolutely. Feasible? Probably not.

Still gonna try? You bet your bonnet I am.

Project Ninja is very much a __WORK IN PROGRESS__ and, being licensed under the GPL, provides absolutely no warranty whatsoever. It may never be fit for purpose, but I really hope it will be someday.

Enjoy!

## The stack ##
This is an NX monorepo, using (as long as I remember to keep this up to date):
- [Nx](https://nx.dev/)
- [Angular](https://angular.io/)
- [NestJS](https://nestjs.com/)
- [Docker](https://www.docker.com/)
- [Jest](https://jestjs.io/)
- [ESLint](https://eslint.org/)
- [Nginx](https://www.nginx.com/)
- [Traefik](https://traefik.io/)

## The architecture ##
There is a single frontend app and a single backend API. The API uses packages that follow something resembling Clean Architecture,
DDD, CQRS, and Event Sourcing.
