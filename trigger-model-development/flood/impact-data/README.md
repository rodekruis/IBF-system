# Flood impact data

Convenience script(s) to get impact data and map it to IBF-system format.

Supported data sources (all included by default):
 1. [DesInventar](https://www.desinventar.net/)
 2. [EM-DAT](https://www.emdat.be/)

```
Usage: get_impact_data.py [OPTIONS]

Options:
  --country TEXT   country (e.g. uganda)
  --disaster TEXT  type of disaster (e.g. flood)
  --help           Show this message and exit.
```
Example:
``` python get_impact_data.py --country=Uganda disaster=flood```
