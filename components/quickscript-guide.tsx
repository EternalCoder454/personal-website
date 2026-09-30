"use client";

import { timeLabel, WEEKDAYS } from "@/lib/quickscript/logic";
import type { Settings } from "@/lib/quickscript/types";
import { Panel } from "./quickscript-ui";

const list = "flex list-disc flex-col gap-1.5 pl-5";
const steps = "flex list-decimal flex-col gap-1.5 pl-5";

/** One plain page for whoever takes over. No data to load, so it is always there. */
export function GuideView({ settings }: { settings: Settings | undefined }) {
  const when = settings ? `${WEEKDAYS[settings.schedule.day]} at ${timeLabel(settings.schedule.time)}` : "Sunday at 8:00 PM";
  return (
    <div className="flex max-w-3xl flex-col gap-5 leading-7">
      <Panel title="What QuickScript does">
        <p>
          QuickScript helps make a short tax video for the Tax Facts FAQs YouTube channel every week. It finds the tax questions people are asking,
          writes draft scripts for the best ones, and emails them to the Host. Everything after that is done by people. It never publishes
          anything by itself.
        </p>
      </Panel>

      <Panel title="Who does what">
        <ul className={list}>
          <li>
            <strong className="font-medium">Host:</strong> reads each script, checks every number, replies Approved, then records the videos on a phone.
          </li>
          <li>
            <strong className="font-medium">Producer:</strong> runs this console, edits each video and schedules the upload on YouTube.
          </li>
          <li>
            <strong className="font-medium">Clipper:</strong> cuts short clips from each video and uses them in Meta Ads.
          </li>
        </ul>
      </Panel>

      <Panel title="What runs by itself">
        <p>
          Every {when} (set in Settings), QuickScript finds the week&apos;s topics, writes the scripts and emails them to the Host. Nothing has to be
          clicked for that.
        </p>
        <p className="mt-3">A person has to do everything else:</p>
        <ul className={`${list} mt-1`}>
          <li>Approving the scripts</li>
          <li>Recording, editing and scheduling the videos</li>
          <li>Cutting clips and using them in Meta Ads</li>
          <li>Updating the Posting Log as each step finishes</li>
        </ul>
      </Panel>

      <Panel title="Each week">
        <ol className={steps}>
          <li>Open This week. The card at the top says what to do now. If the automatic run did not happen, press its button.</li>
          <li>Open Scripts. Check the checks for each script, then send the ones that look right to the Host.</li>
          <li>The Host replies Approved. Open Posting Log and update it from the sheet to see the new status.</li>
          <li>For each approved script, make the publish pack on the Scripts tab. The Producer uses it when uploading to YouTube.</li>
          <li>Watch the steps on This week. Each one says who it is waiting on. Nudge that person if it stays stuck.</li>
        </ol>
      </Panel>

      <Panel title="If something breaks">
        <p>
          Every step can be done by hand without QuickScript. Try the button again in an hour first. If it keeps failing, use the manual routine
          from the Instruction Manual:
        </p>
        <ol className={`${steps} mt-2`}>
          <li>
            Topics: look up Google Trends (Rising, past 7 days), the YouTube search suggestions, and r/tax and r/personalfinance for questions that
            repeat. Ask the Host for the three questions clients asked most, without names. Check the IRS tax calendar for deadlines. Paste
            the notes into a free AI chatbot and ask it to rank the 10 best topics. Pick 3.
          </li>
          <li>
            Scripts: open the IRS.gov page for each topic, paste its text into the chatbot with the script prompt from the Instruction Manual, and read the
            result out loud. Save it in the Drive folder 1 Scripts and share it with the Host.
          </li>
          <li>The Host checks every number against IRS.gov and marks the script Approved in the Posting Log.</li>
        </ol>
        <p className="mt-3">
          The program never publishes anything by itself. Nothing goes on YouTube or into an ad until a person does it, so a broken week costs time, not
          mistakes.
        </p>
      </Panel>

      <Panel title="Where things live">
        <ul className={list}>
          <li>
            Google Drive folder <strong className="font-medium">QuickScript</strong>, with five folders inside:
            <ul className={`${list} mt-1`}>
              <li>1 Scripts: drafts and approved scripts</li>
              <li>2 Raw: phone recordings</li>
              <li>3 Edited: finished videos</li>
              <li>4 Clips: short clips for Meta Ads</li>
              <li>5 Posted: finished items, moved here after posting</li>
            </ul>
          </li>
          <li>
            Google Sheet <strong className="font-medium">Posting Log</strong>, in the same folder. One row per video, with a date in each column as the
            step finishes.
          </li>
          <li>
            The Instruction Manual has the full steps, the script prompt and the list of common problems.
          </li>
        </ul>
      </Panel>
    </div>
  );
}
