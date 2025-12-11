import { useMqttConnectionContext } from "@/components/context/MqttConnectionContext";
import { usePondsDataContext } from "@/components/context/PondsDataprovider";
import { useMqttPublishSubscribe } from "@/hooks/useMqttPublishSubscribe";
import {
  updateMotorsModeAndState,
  updateMotorsModeAndState2,
} from "@/lib/helpers/map/mqttHelpers/updateMotorsModeAndState";

import { deleteMotorAPI, singlePondAPI } from "@/lib/services/ponds";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useNavigate, useParams } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import PondMotorsCard from "./PondMotorsCard";
const SinglePondPage = () => {
  const { client, isConnected } = useMqttConnectionContext();
  const queryClient = useQueryClient();
  const {
    isSubscribed,
    latestMotorControlAck,
    latestLiveData,
    latestModeChangeAck,
    subscribeToGatewayTopics,
    unsubscribeFromGatewayTopics,
    handleMotorContorlPublish,
    handleMotorModePublish,
  } = useMqttPublishSubscribe({
    client,
    isConnected,
  });

  const [selectedPondIndex, setSelectedPondIndex] = useState<number | null>(
    null
  );
  const [dateRange, setDateRange] = useState<{
    from_date: string;
    to_date: string;
  } | null>(null);
  const { pond_id } = useParams({ strict: false });
  const navigate = useNavigate();
  const { pondsData } = usePondsDataContext();
  const { mapPonds } = useMemo(() => {
    const updatedMotors = updateMotorsModeAndState(
      pondsData,
      latestMotorControlAck,
      latestModeChangeAck,
      latestLiveData
    );
    return {
      mapPonds: updatedMotors,
    };
  }, [pondsData, latestMotorControlAck, latestModeChangeAck, latestLiveData]);

  const { data: singlePondData, isLoading: isSinglePondLoading } = useQuery({
    queryKey: ["single-pond", pond_id],
    queryFn: async () => {
      if (!pond_id) return;
      const response = await singlePondAPI(pond_id as unknown as number);
      return response.data.data;
    },
    enabled: !!pond_id,
    refetchOnMount: "always",
    refetchOnWindowFocus: false,
    staleTime: 0,
  });

  const { mutate: deleteMotor, isPending: isDeletingMotorPending } =
    useMutation({
      mutationFn: ({ motorId, pondId }: { motorId: number; pondId: number }) =>
        deleteMotorAPI(motorId, pondId),
      onSuccess: async () => {
        toast.success("Motor deleted successfully!");
        await Promise.all([
          queryClient.invalidateQueries({ queryKey: ["all-ponds"] }),
          queryClient.invalidateQueries({ queryKey: ["paginated-ponds"] }),
          queryClient.invalidateQueries({ queryKey: ["single-pond"] }),
          queryClient.invalidateQueries({ queryKey: ["user-devices"] }),
        ]);
      },

      onError: (error: any) => {
        if (error?.status === 409) {
          toast.error(error?.data?.message);
        }
      },
      retry: false,
    });

  const motors = useMemo(() => {
    const allMotors = singlePondData?.motors || [];
    const updatedMotors = updateMotorsModeAndState2(
      allMotors,
      latestMotorControlAck,
      latestModeChangeAck,
      latestLiveData
    );
    return {
      motors: updatedMotors,
    };
  }, [
    singlePondData,
    latestMotorControlAck,
    latestModeChangeAck,
    latestLiveData,
  ]);

  const handleClose = () => {
    navigate({ to: "/ponds" });
  };

  useEffect(() => {
    if (pond_id && mapPonds.length > 0) {
      const pondIndex = mapPonds.findIndex((p) => p.id == pond_id);
      if (pondIndex !== -1) {
        setSelectedPondIndex(pondIndex);
      } else {
        setSelectedPondIndex(null);
      }
    } else {
      setSelectedPondIndex(null);
    }
  }, [pond_id, mapPonds]);

  useEffect(() => {
    if (isConnected && client) {
      subscribeToGatewayTopics();
    }
    return () => {
      if (isSubscribed && client?.connected) {
        unsubscribeFromGatewayTopics();
      }
    };
  }, [isConnected, client]);

  return (
    <div className="h-full w-2/5">
      <PondMotorsCard
        onClose={handleClose}
        selectedPondIndex={selectedPondIndex}
        mapPonds={mapPonds}
        dateRange={dateRange}
        setDateRange={setDateRange}
        handleMotorContorlPublish={handleMotorContorlPublish}
        handleMotorModePublish={handleMotorModePublish}
        motors={motors.motors}
        isSinglePondLoading={isSinglePondLoading}
        deleteMotor={deleteMotor}
        isDeletingMotorPending={isDeletingMotorPending}
      />
    </div>
  );
};

export default SinglePondPage;
