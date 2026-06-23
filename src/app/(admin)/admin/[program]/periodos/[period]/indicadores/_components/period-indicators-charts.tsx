import PeriodAgeRangeByShiftChart from "./period-age-range-by-shift-chart";
import PeriodAgeRangeChart from "./period-age-range-chart";
import PeriodAttendanceChart from "./period-attendance-chart";
import PeriodClassGroupChart from "./period-class-group-chart";
import PeriodClassGroupsComparisonChart from "./period-class-groups-comparison-chart";
import PeriodEnrollmentStatusChart from "./period-enrollment-status-chart";
import PeriodGenderChart from "./period-gender-chart";
import PeriodSadAccessChart from "./period-sad-access-chart";
import PeriodShiftChart from "./period-shift-chart";
import PeriodTransferChart from "./period-transfer-chart";

export default function PeriodIndicatorsCharts({ periodId }: { periodId: string }) {
    return (
        <div className="mt-8 flex flex-col gap-8">
            <div className="flex flex-col gap-8 xl:flex-row">
                <PeriodGenderChart periodId={periodId} />
                <PeriodAgeRangeChart periodId={periodId} />
            </div>

            <div className="grid grid-cols-1 gap-8 @3xl/main:grid-cols-3">
                <PeriodEnrollmentStatusChart periodId={periodId} />
                <PeriodSadAccessChart periodId={periodId} />
                <PeriodTransferChart periodId={periodId} />
            </div>

            <div className="flex flex-col gap-8 xl:flex-row">
                <PeriodShiftChart periodId={periodId} />
                <PeriodClassGroupChart periodId={periodId} />
            </div>

            <div className="grid grid-cols-1 gap-8 @3xl/main:grid-cols-2">
                <PeriodAttendanceChart periodId={periodId} />
                <PeriodClassGroupsComparisonChart periodId={periodId} />
            </div>

            <PeriodAgeRangeByShiftChart periodId={periodId} />
        </div>
    );
}
