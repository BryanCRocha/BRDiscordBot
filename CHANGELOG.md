# CHANGELOG

1.1.1 (August 5, 2018)
- Prevent usage of random teams tool to users who have a role that allows
  them to move players in their server.

1.1.0 (August 4, 2018)
- Update random team creation utility.
    - Team creation now stores teams information in local JSON file.
    - Channel setting - a list of channels can be specified for where users
      may be moved to.
    - User moving - users part of the random team creation will be moved to
      the channels specified by the channel setting.
    - User returning - users part of the random team creation will be moved
      to the first channel specified by the channel setting.

- Created a preferences file.
    - Currently only used to specify the prefix for bot commands. If this is
      not defined, the default "!" will be used

1.0.0 (July 14, 2018)
- Initial Discord bot commit.
