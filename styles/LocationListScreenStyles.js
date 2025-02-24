import { StyleSheet } from 'react-native';

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    backgroundColor: '#f9f9f9',
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  noLocations: { 
    fontSize: 16, 
    textAlign: 'center', 
    marginTop: 20, 
    color: '#777' 
  },
  item: { 
    padding: 15, 
    backgroundColor: '#fff', 
    marginVertical: 8, 
    borderRadius: 10, 
    shadowColor: '#000', 
    shadowOffset: { width: 0, height: 2 }, 
    shadowOpacity: 0.1, 
    shadowRadius: 5, 
    elevation: 3,
  },
  itemContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  textContainer: {
    flex: 1,
  },
  name: { 
    fontSize: 18, 
    fontWeight: 'bold', 
    color: '#222' 
  },
  description: { 
    fontSize: 14, 
    color: '#555', 
    marginTop: 5 
  },
  rating: { 
    fontSize: 16, 
    color: '#ff9800', 
    marginTop: 5 
  },
});

export default styles;
