import { YStack, XStack, View } from "tamagui"

export function CartSidebarShimmer() {
  // Simple shimmer effect using animated background
  return (
    <YStack
      style={{
        backgroundColor: "#f8f9fa",
        padding: 20,
        width: '100%',
        height: 'calc(100vh - 80px)',
       position: 'sticky',
        top: 60,
        overflowY: 'auto',
        borderLeft: '1px solid #e0e0e0',
        alignSelf: 'flex-start'
      }}
    >
      {/* Title shimmer */}
      <View
        style={{
          width: 160,
          height: 28,
          borderRadius: 6,
          background: "linear-gradient(90deg, #ececec 25%, #f5f5f5 50%, #ececec 75%)",
          marginBottom: 24,
          animation: "shimmer 5.8s infinite linear",
        }}
      />
      {/* Cart item shimmers */}
      {[...Array(8)].map((_, idx) => (
        <XStack key={idx} style={{ marginBottom: 20, alignItems: "center" }}>
          <View
            style={{
              width: 60,
              height: 60,
              borderRadius: 8,
              background: "linear-gradient(90deg, #ececec 25%, #f5f5f5 50%, #ececec 75%)",
              marginRight: 12,
              animation: "shimmer 8s infinite linear",
            }}
          />
          <YStack style={{ flex: 1 }}>
            <View
              style={{
                width: "70%",
                height: 18,
                borderRadius: 4,
                background: "linear-gradient(90deg, #ececec 25%, #f5f5f5 50%, #ececec 75%)",
                marginBottom: 8,
                animation: "shimmer 8s infinite linear",
              }}
            />
            <View
              style={{
                width: "40%",
                height: 14,
                borderRadius: 4,
                background: "linear-gradient(90deg, #ececec 25%, #f5f5f5 50%, #ececec 75%)",
                animation: "shimmer 8s infinite linear",
              }}
            />
          </YStack>
        </XStack>
      ))}
      {/* Total shimmer */}
      <View
        style={{
          width: "60%",
          height: 22,
          borderRadius: 4,
          background: "linear-gradient(90deg, #ececec 25%, #f5f5f5 50%, #ececec 75%)",
          marginTop: 32,
          animation: "shimmer 8s infinite linear",
        }}
      />
      {/* Button shimmer */}
      <View
        style={{
          width: "100%",
          height: 40,
          borderRadius: 8,
          background: "linear-gradient(90deg, #ececec 25%, #f5f5f5 50%, #ececec 75%)",
          marginTop: 16,
          animation: "shimmer 8s infinite linear",
        }}
      />
      <style>
        {`
          @keyframes shimmer {
            0% { background-position: -400px 0; }
            100% { background-position: 400px 0; }
          }
          [style*="linear-gradient"] {
            background-size: 800px 104px;
            background-repeat: no-repeat;
          }
        `}
      </style>
    </YStack>
  )
}