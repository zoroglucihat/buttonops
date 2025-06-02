# ServiceBus Deployment Example

This example shows how to deploy ServiceBus resources using the ButtonOps CLI.

## Basic ServiceBus Deployment

Deploy a project with ServiceBus using default settings:

```bash
cht deploy -p myproject -e dev --servicebus
```

This will create:
- ServiceBus namespace: `myproject-dev-servicebus`
- Default queues: `orders`, `notifications`
- Default topics: `events`, `updates`
- SKU: Standard
- Location: West Europe

## Advanced ServiceBus Deployment

Deploy with custom ServiceBus configuration:

```bash
cht deploy -p myproject -e prod \
  --servicebus \
  --servicebus-sku Premium \
  --servicebus-queues "orders,payments,inventory,shipping" \
  --servicebus-topics "user-events,system-events,audit-events" \
  --servicebus-location "North Europe"
```

## ServiceBus Configuration Options

| Option | Description | Default | Example |
|--------|-------------|---------|---------|
| `--servicebus` | Enable ServiceBus deployment | - | `--servicebus` |
| `--servicebus-sku` | ServiceBus pricing tier | Standard | `--servicebus-sku Premium` |
| `--servicebus-queues` | Comma-separated queue names | orders,notifications | `--servicebus-queues "orders,payments"` |
| `--servicebus-topics` | Comma-separated topic names | events,updates | `--servicebus-topics "user-events,audit"` |
| `--servicebus-location` | Azure region | West Europe | `--servicebus-location "North Europe"` |

## Generated Resources

When you run the ServiceBus deployment, the following resources are created:

### Infrastructure Files
- `terraform/servicebus/servicebus.tf` - Terraform configuration
- `terraform/servicebus/servicebus-variables.tf` - Variables
- `terraform/servicebus/servicebus-outputs.tf` - Outputs

### Configuration Files
- `config/servicebus.json` - ServiceBus configuration
- `config/servicebus.{env}.env` - Environment-specific settings

### Scripts
- `scripts/deploy-servicebus.sh` - Deployment script

## Usage in Applications

After deployment, you can use the ServiceBus connection string in your applications:

```javascript
// Node.js example
const { ServiceBusClient } = require("@azure/service-bus");

const connectionString = process.env.SERVICEBUS_CONNECTION_STRING;
const serviceBusClient = new ServiceBusClient(connectionString);

// Send message to queue
const sender = serviceBusClient.createSender("orders");
await sender.sendMessages({ body: "Order data" });

// Receive messages from topic
const receiver = serviceBusClient.createReceiver("events", "events-subscription");
const messages = await receiver.receiveMessages(10);
```

## Environment Variables

The deployment creates these environment variables:

```bash
SERVICEBUS_NAMESPACE=myproject-dev-servicebus
SERVICEBUS_CONNECTION_STRING=Endpoint=sb://...
SERVICEBUS_ENDPOINT=https://myproject-dev-servicebus.servicebus.windows.net/
```

## Monitoring and Management

ServiceBus resources can be monitored through:
- Azure Portal
- Azure CLI: `az servicebus namespace show`
- Azure Monitor metrics
- Application Insights (if configured) 