import StudentsAgeRangeChart from "./students-age-range-chart";
import StudentsGenderChart from "./students-gender-chart";

export default function StudentsIndicatorsCharts() {
    return (
        <div className="mt-8 flex flex-col gap-8 xl:flex-row">
            <StudentsGenderChart />
            <StudentsAgeRangeChart />
        </div>
    );
}
