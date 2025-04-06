import { StyleSheet } from "react-native";

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "black",
  },
  listContent: {
    paddingTop: 0,
  },
  floatingPlayerStyles: {
    backgroundColor: "#252525",
    padding: 25,
    borderRadius: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
    position: "absolute",
    bottom: 20,
    left: 15,
    right: 15,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 20,
    paddingBottom: 10,
    backgroundColor: "black",
  },
  headerTitle: {
    fontSize: 30,
    fontWeight: "bold",
    color: "white",
  },
  songCount: {
    fontSize: 20,
    color: "#888",
  },
  songInfo: {
    alignItems: "flex-end",
  },
  songDuration: {
    fontSize: 14,
    color: "#888",
    marginBottom: 3,
  },
  songType: {
    fontSize: 12,
    color: "#555",
  },
  songContentText: {
    fontSize: 16,
    color: "white",
  },

  artwork: {
    width: 50,
    height: 50,
    borderRadius: 4,
  },

  trackInfo: {
    flex: 1,
    marginLeft: 10,
  },

  trackTitle: {
    fontWeight: "bold",
    fontSize: 16,
  },

  trackArtist: {
    fontSize: 14,
    color: "#666",
  },

  closeButton: {
    padding: 8,
  },
});

export default styles;
