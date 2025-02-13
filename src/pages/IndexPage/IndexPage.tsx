import { Page } from "@/components/Page"
import { initData, User, useSignal } from "@telegram-apps/sdk-react";
import { Text } from "@telegram-apps/telegram-ui"
import { FC, useEffect, useMemo, useState } from "react"

// chart.js
import { Doughnut } from "react-chartjs-2";
import { Chart, ArcElement, Tooltip, Legend } from "chart.js";

// Register ChartJS components
Chart.register(ArcElement, Tooltip, Legend);

const API_URL = "https://baby-kicks-api.loqmanhakim74.workers.dev";

function getUserId(user: User): string {
    return user.id.toString();
}

const getMessage = (kicks: number): string => {
    if (kicks >= 8) return "Your baby is very active!";
    if (kicks >= 4) return "Quite active";
    return "Not really active,\nmaybe they're asleep";
};


export const IndexPage: FC = () => {
    const initDataState = useSignal(initData.state);
    const [data, setData] = useState<number>(0);
    const [isLoading, setIsLoading] = useState<boolean>(false);
    // const [response, setResponse] = useState<any>(null);

    const userId = useMemo<string | undefined>(() => {
        return initDataState && initDataState.user
            ? getUserId(initDataState.user)
            : undefined;
    }, [initDataState]);

    useEffect(() => {
        if (userId) {
            const callApi = async () => {
                setIsLoading(true);
                const res = await fetch(`${API_URL}/api/baby-kick-daily/${userId}`);

                if (res.ok) {
                    const data = await res.json();
                    setData(parseInt(data.total_kicks));
                    // setResponse(data);
                } else {
                    setData(0);
                }
                setIsLoading(false);
            }
            callApi();
        }
    }, [userId]);

    const chartData = {
        labels: ['Kicks Recorded', 'Remaining'],
        datasets: [{
            data: [data || 0, Math.max(0, 10 - (data || 0))],
            backgroundColor: ['#3498db', '#ecf0f1'],
            borderColor: ['#2980b9', '#bdc3c7'],
            borderWidth: 1,
        }]
    };

    const chartOptions = {
        cutout: '70%',
        plugins: {
            legend: {
                display: false
            },
            tooltip: {
                enabled: false
            }
        },
    };

    // Add custom plugin for center text
    const textCenter = {
        id: 'textCenter',
        beforeDraw(chart: any) {
            const { ctx, chartArea: { top, left, width, height } } = chart;
            ctx.save();
            ctx.font = 'bold 14px Arial';  // Made the font bold
            ctx.fillStyle = '#ffffff';      // Changed to white
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            const text = getMessage(data);
            const lineHeight = 20;

            // Add text shadow for better visibility
            ctx.shadowColor = 'rgba(0, 0, 0, 0.5)';
            ctx.shadowBlur = 4;
            ctx.shadowOffsetX = 0;
            ctx.shadowOffsetY = 0;

            const lines = text.split('\n');
            const y = top + (height / 2);

            lines.forEach((line: string, i: number) => {
                const lineY = y + (i - (lines.length - 1) / 2) * lineHeight;
                ctx.fillText(line, left + (width / 2), lineY);
            });
            ctx.restore();
        }
    };

    return (
        <Page back={false}>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%' }}>
                {/* <Text>Total Kicks: {data}</Text>
                <Text>Response: {JSON.stringify(response)}</Text> */}
                {data && (
                    <div>
                        <div style={{ maxWidth: '300px', margin: '20px auto' }}>
                            <Doughnut data={chartData} options={chartOptions} plugins={[textCenter]} />
                        </div>
                        <Text style={{ textAlign: 'center', marginTop: '10px' }}>
                            {data} / 10 kicks today
                        </Text>
                    </div>
                )}
                {isLoading && (
                    <Text>Loading...</Text>
                )}
            </div>
        </Page >
    )
}
