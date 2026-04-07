# daily-light

A command-line tool to display daily devotional readings from *Daily Light on the Daily Path* by Samuel Bagster (1829). Public domain, King James Version text.

The book contains 732 readings — one morning and one evening entry for each day of the year — each composed entirely of curated Scripture passages arranged around a theme verse.

## Install

```bash
npm install -g daily-light
```

Or clone and build locally:

```bash
git clone https://github.com/gm5dna/daily-light.git
cd daily-light
npm install && npm run build && npm link
```

## Usage

```bash
daily-light                     # Today's reading (morning or evening)
daily-light morning             # Today's morning reading
daily-light evening             # Today's evening reading
daily-light jan 1               # Reading for 1 January
daily-light jan 1 morning       # Morning reading for 1 January
daily-light 15 mar evening      # Evening reading for 15 March
daily-light tomorrow            # Reading for tomorrow
daily-light yesterday           # Reading for yesterday
```

### Options

```
--help, -h                      Show help
--version, -v                   Show version
--random, -r                    Show a random reading
--list, -l                      List all readings
--search, -s <term>             Search readings by keyword or reference
```

## Example output

```
────────────────────────────────────────────────────────────────────────
                   DAILY LIGHT — Morning · 1 January
────────────────────────────────────────────────────────────────────────

  "This one thing I do, forgetting those things which are behind,... I
  press toward the mark for the prize of the high calling of God in
  Christ Jesus."
                                                   — Philippians 3:13,14

  Father, I will that they ... whom thou hast given me, be with me where
  I am; that they may behold my glory, which thou hast given me.
                                                            — John 17:24

  I know whom I have believed, and am persuaded that he is able to keep
  that which I have committed unto him against that day.
                                                        — 2 Timothy 1:12

  He which hath begun a good work in you will perform it until the day
  of Jesus Christ.
                                                       — Philippians 1:6

  Know ye not that they which run in a race run all, but one receiveth
  the prize? So run, that ye may obtain. And every man that striveth for
  the mastery is temperate in all things. Now they do it to obtain a
  corruptible crown; but we an incorruptible.
                                                 — 1 Corinthians 9:24,25

  Let us lay aside every weight, and the sin which doth so easily beset
  us, and let us run with patience the race that is set before us,
  looking unto Jesus.
                                                        — Hebrews 12:1,2

────────────────────────────────────────────────────────────────────────
```

## How it works

- **Morning/evening detection**: before 14:00 local time shows the morning reading; 14:00 onwards shows the evening reading.
- **Date parsing**: accepts flexible formats — `jan 1`, `1 jan`, `january 1`, `1 january`, plus `tomorrow` and `yesterday`.
- **Terminal styling**: ANSI colours and styles where supported, automatically stripped when output is piped.
- **No network calls**: all 732 readings are bundled in the package.

## Requirements

- Node.js >= 18

## Licence

MIT. The text of *Daily Light on the Daily Path* is in the public domain.
